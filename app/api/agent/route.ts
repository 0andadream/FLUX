import { planFromKeywords, planFromModel, type Plan } from "@/lib/plan";
import { jsonError, readJson } from "@/lib/upstream";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM = [
  "You are Flux, a studio agent on Celo.",
  "Propose one generation. Reply with one JSON object and no markdown.",
  'Keys: "modality" one of image, video, music, voice; "prompt" string; "reply" one sentence.',
  "Music means a buy.ai composition followed by a separate spoken vocal. Do not invent a URL, a price, or a token.",
  "The person reviews the onchain quote and signs it themselves.",
].join(" ");

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const messages = normalizeMessages(body.messages);
    if (messages.length === 0) throw new Error("Say what you want to generate.");
    const latest = messages[messages.length - 1]?.content ?? "";
    const plan = (await planWithGrok(messages)) ?? planFromKeywords(latest);
    return Response.json(plan satisfies Plan);
  } catch (error) {
    return jsonError(error);
  }
}

function normalizeMessages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-6)
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const role = record.role === "assistant" ? "assistant" : record.role === "user" ? "user" : "";
      const content = typeof record.content === "string" ? record.content.trim().slice(0, 2000) : "";
      if (!role || !content) return [];
      return [{ role, content }];
    });
}

async function planWithGrok(messages: { role: string; content: string }[]) {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  try {
    const response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "grok-4.7",
        input: [{ role: "system", content: SYSTEM }, ...messages],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as unknown;
    const text = outputText(payload);
    return text ? planFromModel(text) : null;
  } catch {
    return null;
  }
}

function outputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === "string") return record.output_text;
  if (!Array.isArray(record.output)) return "";
  const parts: string[] = [];
  for (const item of record.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (typeof content === "string") parts.push(content);
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block && typeof block === "object" && typeof (block as { text?: unknown }).text === "string") {
        parts.push((block as { text: string }).text);
      }
    }
  }
  return parts.join("\n");
}
