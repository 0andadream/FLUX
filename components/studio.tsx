"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useSignTypedData, useSwitchChain } from "wagmi";
import { ResultView } from "@/components/result-view";
import { CELO_MAINNET_ID } from "@/lib/celo";
import { celoScanAddress, celoScanTx, formatAtomic, formatUsd, shortAddress } from "@/lib/format";
import { writeActivity } from "@/lib/history";
import { MODALITIES, MODALITY_META, isModality, type Modality } from "@/lib/modalities";
import { pickOffer, type QuotedOffer } from "@/lib/offers";
import { createPaymentHeader } from "@/lib/pay";
import { readPreferredToken, subscribePreferredToken } from "@/lib/preferences";
import { parseComposition, presentResult, type Presented } from "@/lib/result";
import type { Settlement } from "@/lib/receipt";

type Quote = {
  modality: Modality;
  rail: "buy" | "x402";
  service: string;
  note: string;
  url: string;
  version: 1 | 2;
  extensions: Record<string, unknown>;
  offers: QuotedOffer[];
};

type Composition = NonNullable<ReturnType<typeof parseComposition>>;

type Phase =
  | { name: "ready" }
  | { name: "quoting" }
  | { name: "confirm"; prompt: string; quote: Quote; index: number }
  | { name: "signing" }
  | { name: "settling" }
  | { name: "done"; prompt: string; quote: Quote; offer: QuotedOffer; presented: Presented; settlement: Settlement; composition: Composition | null }
  | { name: "error"; message: string };

export function Studio() {
  const params = useSearchParams();
  const initialType = params.get("type");
  const [modality, setModality] = useState<Modality>(isModality(initialType) ? initialType : "image");
  const [prompt, setPrompt] = useState(params.get("prompt") ?? "");
  const preferred = useSyncExternalStore(subscribePreferredToken, readPreferredToken, () => "USAT");
  const [phase, setPhase] = useState<Phase>({ name: "ready" });
  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();
  const { signTypedDataAsync } = useSignTypedData();

  const busy = phase.name === "quoting" || phase.name === "signing" || phase.name === "settling";
  const wrongChain = isConnected && chainId !== CELO_MAINNET_ID;
  const offer = phase.name === "confirm" ? phase.quote.offers[phase.index] : null;

  function editPrompt(value: string) {
    setPrompt(value);
    if (phase.name === "confirm") setPhase({ name: "ready" });
  }

  function editModality(value: Modality) {
    setModality(value);
    if (phase.name === "confirm") setPhase({ name: "ready" });
  }

  async function quoteFor(nextModality: Modality, nextPrompt: string) {
    setPhase({ name: "quoting" });
    const quote = await postJson<Quote>("/api/quote", { modality: nextModality, prompt: nextPrompt });
    const picked = pickOffer(quote.offers, preferred) ?? quote.offers[0];
    const index = Math.max(0, quote.offers.findIndex((item) => item.asset === picked.asset && item.network === picked.network && item.amount === picked.amount));
    setPhase({ name: "confirm", prompt: nextPrompt, quote, index });
  }

  async function onGenerate() {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (wrongChain) {
      await switchChainAsync({ chainId: CELO_MAINNET_ID });
      return;
    }
    try {
      await quoteFor(modality, prompt);
    } catch (error) {
      setPhase({ name: "error", message: errorMessage(error) });
    }
  }

  async function onPay() {
    if (phase.name !== "confirm" || !address || !offer) return;
    const current = phase;
    const selected = current.quote.offers[current.index];
    setPhase({ name: "signing" });
    try {
      const headers = await createPaymentHeader(
        {
          address,
          signTypedData: (message) => signTypedDataAsync(message as never),
        },
        selected,
        selected.accept,
        current.quote.extensions,
      );
      setPhase({ name: "settling" });
      const settled = await postJson<{ status: number; body: unknown; settlement: Settlement | null }>("/api/settle", {
        modality: current.quote.modality,
        prompt: current.prompt,
        headers,
      });
      const tx = settled.settlement?.transaction ?? "";
      if (!/^0x[0-9a-fA-F]{64}$/.test(tx)) {
        const reason = settled.settlement?.error || `The service answered ${settled.status} and did not return a transaction.`;
        throw new Error(reason);
      }
      writeActivity({
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        modality: current.quote.modality,
        service: current.quote.service,
        prompt: current.prompt,
        token: selected.tokenLabel,
        amount: selected.amount,
        decimals: selected.decimals,
        txHash: tx,
        payer: settled.settlement?.payer || address,
        payTo: selected.payTo,
        network: selected.network,
        resource: current.quote.url,
      });
      setPhase({
        name: "done",
        prompt: current.prompt,
        quote: current.quote,
        offer: selected,
        presented: presentResult(settled.body),
        settlement: settled.settlement!,
        composition: current.quote.modality === "music" ? parseComposition(settled.body) : null,
      });
    } catch (error) {
      setPhase({ name: "error", message: errorMessage(error) });
    }
  }

  async function onVocal(composition: Composition) {
    try {
      await quoteFor("voice", composition.vocal);
    } catch (error) {
      setPhase({ name: "error", message: errorMessage(error) });
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 md:p-6">
        <div className="flex flex-wrap gap-2">
          {MODALITIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => editModality(item)}
              className={`rounded-full px-3 py-1.5 text-sm ${modality === item ? "bg-white text-black" : "border border-white/15 text-zinc-300"}`}
            >
              {MODALITY_META[item].label}
            </button>
          ))}
        </div>
        <label className="mt-5 block text-sm text-zinc-400" htmlFor="prompt">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => editPrompt(event.target.value)}
          rows={5}
          placeholder={modality === "voice" ? "Text to speak, up to 280 characters." : "Describe what Flux should buy."}
          className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black px-4 py-3 text-base outline-none"
        />
        <p className="mt-3 text-sm text-zinc-400">{MODALITY_META[modality].blurb}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy || (isConnected && !wrongChain && !prompt.trim())}
            onClick={() => void onGenerate()}
            className="rounded-full bg-[#8b7cff] px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            {phase.name === "quoting" ? "Requesting price…" : !isConnected ? "Connect wallet" : wrongChain ? "Switch to Celo" : "Get price"}
          </button>
          {phase.name === "error" ? <p className="max-w-xl text-sm text-red-300">{phase.message}</p> : null}
        </div>
        {phase.name === "confirm" && offer ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-black p-5">
            <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">Quote · {phase.quote.rail}</p>
            <p className="mt-2 text-3xl font-medium">{priceOf(offer)}</p>
            <p className="mt-2 text-sm text-zinc-300">{phase.quote.service}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{phase.quote.note}</p>
            <dl className="mt-4 grid gap-2 text-sm text-zinc-300">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Pay to</dt>
                <dd>
                  <a className="underline decoration-white/20" href={celoScanAddress(offer.payTo)} target="_blank" rel="noreferrer">
                    {shortAddress(offer.payTo, 6)}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Network</dt>
                <dd>Celo mainnet</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Transfer</dt>
                <dd>{offer.transfer === "permit2" ? "Permit2" : "EIP-3009"}</dd>
              </div>
            </dl>
            {phase.quote.offers.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {phase.quote.offers.map((item, index) => (
                  <button
                    key={`${item.asset}-${item.network}-${item.amount}`}
                    type="button"
                    onClick={() => setPhase({ ...phase, index })}
                    className={`rounded-full px-3 py-1.5 text-xs ${index === phase.index ? "bg-white text-black" : "border border-white/15 text-zinc-300"}`}
                  >
                    {item.tokenLabel}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => void onPay()} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black">
                Approve and generate
              </button>
              <button type="button" onClick={() => setPhase({ name: "ready" })} className="rounded-full px-4 py-3 text-sm text-zinc-300">
                Cancel
              </button>
            </div>
          </div>
        ) : null}
        {phase.name === "signing" || phase.name === "settling" ? (
          <p className="mt-6 text-sm text-zinc-300">
            {phase.name === "signing" ? "Waiting for your wallet signature. This does not broadcast a transaction by itself." : "Payment sent. Waiting for the service and the onchain settlement."}
          </p>
        ) : null}
        {phase.name === "done" ? (
          <div className="mt-6 space-y-5">
            <ResultView result={phase.presented} />
            <SettlementLine offer={phase.offer} settlement={phase.settlement} />
            {phase.composition ? (
              <div className="rounded-3xl border border-white/10 p-5">
                <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">Composition</p>
                <h2 className="mt-2 text-2xl font-medium">{phase.composition.title}</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {[phase.composition.key, phase.composition.bpm ? `${phase.composition.bpm} bpm` : ""].filter(Boolean).join(" · ")}
                </p>
                {phase.composition.lyrics ? <p className="mt-4 text-sm leading-6 whitespace-pre-wrap text-zinc-200">{phase.composition.lyrics}</p> : null}
                <p className="mt-4 text-sm text-zinc-400">Vocal line, paid separately: {phase.composition.vocal}</p>
                <button type="button" onClick={() => void onVocal(phase.composition!)} className="mt-4 rounded-full bg-[#8b7cff] px-4 py-2 text-sm text-white">
                  Price the vocal
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
      <aside className="h-fit rounded-[2rem] border border-white/10 p-5 text-sm leading-6 text-zinc-400">
        <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">How a purchase works</p>
        <p className="mt-3 text-zinc-200">Image, video, and voice are quoted by agent402 on Celo. The live quotes seen so far accept USDC.</p>
        <p className="mt-3">Music is two purchases. buy.ai Cencori writes the score and can settle in USDC, USD₮, or USA₮. The spoken line is a second signature.</p>
        <p className="mt-3">Nothing is charged when you ask for a price. The wallet popup is the payment.</p>
      </aside>
    </div>
  );
}

function SettlementLine({ offer, settlement }: { offer: QuotedOffer; settlement: Settlement }) {
  return (
    <p className="text-sm text-zinc-300">
      {settlement.success ? "Settled" : "Settlement reported a problem"} · {priceOf(offer)} ·{" "}
      <a className="underline decoration-white/20" href={celoScanTx(settlement.transaction)} target="_blank" rel="noreferrer">
        View transaction
      </a>
    </p>
  );
}

function priceOf(offer: QuotedOffer) {
  const dollar = offer.tokenSymbol === "USDC" || offer.tokenSymbol === "USDT" || offer.tokenSymbol === "USAT";
  const amount = dollar ? formatUsd(offer.amount, offer.decimals) : formatAtomic(offer.amount, offer.decimals);
  return `${amount} ${offer.tokenLabel}`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return message.length > 500 ? `${message.slice(0, 500)}…` : message;
}
