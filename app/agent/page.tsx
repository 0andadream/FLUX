"use client";

import Link from "next/link";
import { useState } from "react";
import { MODALITY_META, type Modality } from "@/lib/modalities";

type Turn = { role: "user" | "assistant"; content: string; plan?: { modality: Modality; prompt: string; source: "grok" | "keywords" } };

export default function AgentPage() {
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || busy) return;
    const next = [...turns, { role: "user" as const, content }];
    setTurns(next);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content: text }) => ({ role, content: text })) }),
      });
      const data = (await response.json()) as { error?: string; reply?: string; modality?: Modality; prompt?: string; source?: "grok" | "keywords" };
      if (!response.ok || !data.reply || !data.modality || !data.prompt || !data.source) {
        throw new Error(data.error || "The agent did not return a plan.");
      }
      setTurns([
        ...next,
        {
          role: "assistant",
          content: data.reply,
          plan: { modality: data.modality, prompt: data.prompt, source: data.source },
        },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The agent is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">Agent</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          The agent proposes a generation. It cannot sign or spend. With <span className="font-mono">XAI_API_KEY</span> set, the plan comes from Grok. Otherwise Flux uses the wording of your request.
        </p>
      </div>
      <div className="min-h-64 space-y-4">
        {turns.length === 0 ? <p className="text-sm text-zinc-500">Try “a short film of a black geometric mark” or “a song about rain on the line”.</p> : null}
        {turns.map((turn, index) => (
          <article key={`${turn.role}-${index}`} className={turn.role === "user" ? "text-right" : ""}>
            <p className={`inline-block max-w-[40rem] rounded-3xl px-4 py-3 text-left text-sm leading-6 ${turn.role === "user" ? "bg-white text-black" : "border border-white/10 text-zinc-200"}`}>
              {turn.content}
            </p>
            {turn.plan ? (
              <div className="mt-2 text-left">
                <Link
                  href={`/studio?type=${turn.plan.modality}&prompt=${encodeURIComponent(turn.plan.prompt)}`}
                  className="inline-flex rounded-full bg-[#8b7cff] px-4 py-2 text-sm text-white"
                >
                  Open {MODALITY_META[turn.plan.modality].label.toLowerCase()} in the studio
                </Link>
                <p className="mt-2 text-xs text-zinc-500">{turn.plan.source === "grok" ? "Planned by Grok" : "Planned from your wording. Set XAI_API_KEY to use Grok."}</p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What should Flux make?"
          className="flex-1 rounded-full border border-white/10 bg-black px-4 py-3 text-sm outline-none"
        />
        <button type="submit" disabled={busy || !draft.trim()} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-40">
          {busy ? "Thinking…" : "Ask"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
