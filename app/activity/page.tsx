"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Kicker } from "@/components/frame";
import { celoScanAddress, celoScanTx, formatAtomic, formatUsd, shortAddress } from "@/lib/format";
import { activitySnapshot, subscribeActivity, type Activity } from "@/lib/history";

export default function ActivityPage() {
  const raw = useSyncExternalStore(subscribeActivity, activitySnapshot, () => "[]");
  const entries = useMemo(() => parseActivity(raw), [raw]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <Kicker index="02">Activity</Kicker>
      <h1 className="mt-4 text-[clamp(2rem,1.2rem+2vw,3rem)] leading-none font-[340] tracking-[-0.035em]">Receipts from this browser.</h1>
      <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
        A row appears only after a settlement returns a transaction hash. Open the hash on Celoscan and match the payer to the connected wallet.
      </p>
      {entries.length === 0 ? <p className="mt-10 text-[15px] text-muted">No settlements yet.</p> : null}
      <ul className="mt-8 space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="glass rounded-[24px] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[15px] font-[520] tracking-[-0.02em] text-ink">
                {entry.modality} · {money(entry)}
              </p>
              <time className="text-[12px] text-muted">{new Date(entry.at).toLocaleString()}</time>
            </div>
            <p className="mt-2 text-[14px] text-ink-soft">{entry.prompt}</p>
            <p className="mt-2 text-[12px] text-muted">{entry.service}</p>
            <p className="mt-3 flex flex-wrap gap-4 text-[14px]">
              <a className="link font-mono text-[12px]" href={celoScanTx(entry.txHash)} target="_blank" rel="noreferrer">
                {shortAddress(entry.txHash, 6)}
              </a>
              <a className="link" href={celoScanAddress(entry.payTo)} target="_blank" rel="noreferrer">
                Payee {shortAddress(entry.payTo)}
              </a>
              {entry.payer ? <span className="text-muted">Payer {shortAddress(entry.payer)}</span> : null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function parseActivity(raw: string): Activity[] {
  try {
    const parsed = JSON.parse(raw) as Activity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function money(entry: Activity) {
  const dollar = entry.decimals === 6 && (entry.token === "USDC" || entry.token === "USD₮" || entry.token === "USA₮");
  return dollar ? `${formatUsd(entry.amount, entry.decimals)} ${entry.token}` : `${formatAtomic(entry.amount, entry.decimals)} ${entry.token}`;
}
