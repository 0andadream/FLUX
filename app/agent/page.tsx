"use client";

import Link from "next/link";
import { useState } from "react";
import { Kicker, Knob } from "@/components/frame";
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 md:py-16">
      <div>
        <Kicker index="03">Agent</Kicker>
        <h1 className="mt-4 text-[clamp(2rem,1.2rem+2vw,3rem)] leading-none font-[340] tracking-[-0.035em]">It proposes. It never pays.</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted">
          The agent proposes a generation. It cannot sign or spend. With <span className="font-mono text-[13px]">XAI_API_KEY</span> set, the plan comes from Grok. Otherwise Flux uses the wording of your request.
        </p>
      </div>
      <div className="min-h-64 space-y-4">
        {turns.length === 0 ? <p className="text-[14px] text-muted">Try “a short film of a black geometric mark” or “a song about rain on the line”.</p> : null}
        {turns.map((turn, index) => (
          <article key={`${turn.role}-${index}`} className={turn.role === "user" ? "text-right" : ""}>
            <p className={`inline-block max-w-[40rem] rounded-[22px] px-4 py-3 text-left text-[14px] leading-6 ${turn.role === "user" ? "bg-ink text-white" : "glass text-ink"}`}>
              {turn.content}
            </p>
            {turn.plan ? (
              <div className="mt-3 text-left">
                <Link href={`/studio?type=${turn.plan.modality}&prompt=${encodeURIComponent(turn.plan.prompt)}`} className="btn-ink">
                  <span>Open {MODALITY_META[turn.plan.modality].label.toLowerCase()} in the studio</span>
                  <Knob />
                </Link>
                <p className="mt-2 text-[12px] text-muted">{turn.plan.source === "grok" ? "Planned by Grok" : "Planned from your wording. Set XAI_API_KEY to use Grok."}</p>
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
          className="field flex-1 rounded-full outline-none"
        />
        <button type="submit" disabled={busy || !draft.trim()} className="btn-ink">
          <span>{busy ? "Thinking…" : "Ask"}</span>
          <Knob />
        </button>
      </form>
      {error ? <p className="text-[14px] text-[#B02A35]">{error}</p> : null}
    </div>
  );
}
