"use client";

import { useMemo, useSyncExternalStore } from "react";
import { celoScanAddress, celoScanTx, formatAtomic, formatUsd, shortAddress } from "@/lib/format";
import { activitySnapshot, subscribeActivity, type Activity } from "@/lib/history";

export default function ActivityPage() {
  const raw = useSyncExternalStore(subscribeActivity, activitySnapshot, () => "[]");
  const entries = useMemo(() => parseActivity(raw), [raw]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-medium tracking-tight">Activity</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
        Receipts from this browser. A row appears only after a settlement returns a transaction hash. Judges can open the hash on Celoscan and match the payer to the connected wallet.
      </p>
      {entries.length === 0 ? <p className="mt-8 text-sm text-zinc-400">No settlements yet.</p> : null}
      <ul className="mt-8 space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-3xl border border-white/10 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-white">
                {entry.modality} · {money(entry)}
              </p>
              <time className="text-xs text-zinc-500">{new Date(entry.at).toLocaleString()}</time>
            </div>
            <p className="mt-2 text-sm text-zinc-300">{entry.prompt}</p>
            <p className="mt-2 text-xs text-zinc-500">{entry.service}</p>
            <p className="mt-3 flex flex-wrap gap-4 text-sm">
              <a className="underline decoration-white/20" href={celoScanTx(entry.txHash)} target="_blank" rel="noreferrer">
                {shortAddress(entry.txHash, 6)}
              </a>
              <a className="text-zinc-400 underline decoration-white/20" href={celoScanAddress(entry.payTo)} target="_blank" rel="noreferrer">
                Payee {shortAddress(entry.payTo)}
              </a>
              {entry.payer ? <span className="text-zinc-500">Payer {shortAddress(entry.payer)}</span> : null}
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
