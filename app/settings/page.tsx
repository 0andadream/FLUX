"use client";

import { useState, useSyncExternalStore } from "react";
import { parseEventLogs } from "viem";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { Kicker, Knob } from "@/components/frame";
import { attributionCode, attributionSuffix } from "@/lib/attribution";
import { CELO_MAINNET_ID, IDENTITY_REGISTRY, REPUTATION_REGISTRY, USDC_FEE_ADAPTER } from "@/lib/celo";
import { agentScan, celoScanAddress, celoScanTx, shortAddress } from "@/lib/format";
import { identityAbi, identitySnapshot, subscribeIdentity, writeIdentity, type IdentityRecord } from "@/lib/identity";
import { readPreferredToken, subscribePreferredToken, writePreferredToken } from "@/lib/preferences";
import { config, walletConnectEnabled } from "@/lib/wagmi";

const TOKENS = ["USAT", "USDT", "USDC"] as const;

export default function SettingsPage() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();
  const preferred = useSyncExternalStore(subscribePreferredToken, readPreferredToken, () => "USAT");
  const identityRaw = useSyncExternalStore(subscribeIdentity, identitySnapshot, () => "");
  const identity = parseIdentity(identityRaw);
  const origin = useSyncExternalStore(emptySubscribe, readOrigin, () => "");
  const [payGasInUsdc, setPayGasInUsdc] = useState(false);
  const [message, setMessage] = useState("");
  const publishedId = process.env.NEXT_PUBLIC_AGENT_ID?.trim() || "";

  const registrationUri = origin ? `${origin}/agent-registration.json` : "";
  const localHost = origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");
  const code = attributionCode();

  async function register(update: boolean) {
    if (!address) return;
    setMessage("");
    try {
      if (chainId !== CELO_MAINNET_ID) await switchChainAsync({ chainId: CELO_MAINNET_ID });
      const hash = await writeContractAsync({
        address: IDENTITY_REGISTRY,
        abi: identityAbi,
        functionName: update ? "setAgentURI" : "register",
        args: update ? [BigInt(identity?.agentId || "0"), registrationUri] : [registrationUri],
        chainId: CELO_MAINNET_ID,
        dataSuffix: attributionSuffix(),
        ...(payGasInUsdc ? { feeCurrency: USDC_FEE_ADAPTER } : {}),
      } as Parameters<typeof writeContractAsync>[0]);
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (!update) {
        const [registered] = parseEventLogs({ abi: identityAbi, eventName: "Registered", logs: receipt.logs });
        const agentId = registered?.args.agentId?.toString();
        if (!agentId) throw new Error("The transaction mined, but the Registered event was missing.");
        writeIdentity({ agentId, uri: registrationUri, txHash: hash, owner: address });
        setMessage(`Registered as agent ${agentId}.`);
      } else {
        setMessage("Updated the agent URI.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message.slice(0, 500) : "The transaction was not sent.");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 md:py-16">
      <div>
        <Kicker index="04">Settings</Kicker>
        <h1 className="mt-4 text-[clamp(2rem,1.2rem+2vw,3rem)] leading-none font-[340] tracking-[-0.035em]">Wallet, token, identity.</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted">Preferred stablecoin, and the ERC-8004 identity for this studio.</p>
      </div>
      <section className="glass rounded-[24px] p-6">
        <h2 className="kicker">Wallet</h2>
        <p className="mt-3 text-[15px] text-ink">{isConnected && address ? shortAddress(address, 6) : "Not connected. Use the button in the header."}</p>
        <p className="mt-2 text-[14px] leading-6 text-muted">
          {walletConnectEnabled ? "WalletConnect is configured." : "WalletConnect is off until NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set. An injected wallet such as MetaMask or MiniPay can still connect."}
        </p>
      </section>
      <section className="glass rounded-[24px] p-6">
        <h2 className="kicker">Preferred token</h2>
        <p className="mt-3 text-[14px] leading-6 text-muted">Used when a quote lists more than one Celo asset. Image, video, and voice quotes seen so far list USDC only. buy.ai can list USDC, USD₮, and USA₮.</p>
        <div className="mt-4 flex gap-2">
          {TOKENS.map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => writePreferredToken(token)}
              className={`chip ${preferred === token ? "chip-on" : ""}`}
            >
              {token === "USAT" ? "USA₮" : token === "USDT" ? "USD₮" : "USDC"}
            </button>
          ))}
        </div>
      </section>
      <section className="glass rounded-[24px] p-6">
        <h2 className="kicker">ERC-8004 identity</h2>
        <p className="mt-3 text-[14px] leading-6 text-muted">
          Registration mints the agent NFT to the connected wallet and sets that wallet as the agent wallet. The call carries the ERC-8021 attribution suffix. x402 settlements are submitted by the facilitator, which does not attach that suffix yet.
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Identity registry" value={shortAddress(IDENTITY_REGISTRY, 6)} href={celoScanAddress(IDENTITY_REGISTRY)} />
          <Row label="Reputation registry" value={shortAddress(REPUTATION_REGISTRY, 6)} href={celoScanAddress(REPUTATION_REGISTRY)} />
          <Row label="Attribution code" value={code} />
          <Row label="Registration file" value={registrationUri || "…"} href={registrationUri || undefined} />
        </dl>
        {localHost ? (
          <p className="mt-3 text-[14px] text-[#8A520E]">This origin is local. Mainnet registration should point at a public URL so other agents can read the file.</p>
        ) : null}
        {publishedId ? (
          <p className="mt-3 text-[14px]">
            Published agent id {publishedId}.{" "}
            <a className="link" href={agentScan(publishedId)} target="_blank" rel="noreferrer">
              View on 8004scan
            </a>
          </p>
        ) : null}
        {identity ? (
          <p className="mt-3 text-[14px] text-ink">
            This browser registered agent {identity.agentId}.{" "}
            <a className="link" href={agentScan(identity.agentId)} target="_blank" rel="noreferrer">
              8004scan
            </a>
            {" · "}
            <a className="link" href={celoScanTx(identity.txHash)} target="_blank" rel="noreferrer">
              registration tx
            </a>
          </p>
        ) : null}
        <label className="mt-4 flex items-center gap-2 text-[14px] text-ink">
          <input type="checkbox" checked={payGasInUsdc} onChange={(event) => setPayGasInUsdc(event.target.checked)} />
          Pay registration gas in USDC
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" disabled={!isConnected || isPending || !registrationUri} onClick={() => void register(false)} className="btn-ink">
            <span>{isPending ? "Waiting for wallet…" : "Register on Celo"}</span>
            <Knob />
          </button>
          {identity ? (
            <button type="button" disabled={!isConnected || isPending} onClick={() => void register(true)} className="chip">
              Update URI
            </button>
          ) : null}
        </div>
        {message ? <p className="mt-3 text-[14px] text-ink">{message}</p> : null}
      </section>
    </div>
  );
}

function emptySubscribe() {
  return () => {};
}

function readOrigin() {
  return window.location.origin;
}

function parseIdentity(raw: string): IdentityRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as IdentityRecord;
    if (!parsed || typeof parsed.agentId !== "string" || typeof parsed.txHash !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[28rem] text-right break-all text-ink">
        {href ? (
          <a className="link" href={href} target="_blank" rel="noreferrer">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
