import { isModality, MODALITY_META, type Modality } from "./modalities";

export type Plan = {
  modality: Modality;
  prompt: string;
  reply: string;
  source: "grok" | "keywords";
};

export function planFromKeywords(text: string): Plan {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  let modality: Modality = "image";
  if (/\b(video|clip|film|animate)\b/.test(lower)) modality = "video";
  else if (/\b(song|music|lyric|lyrics|beat|compose|soundtrack)\b/.test(lower)) modality = "music";
  else if (/\b(voice|speak|say|narrat|read aloud|tts)\b/.test(lower)) modality = "voice";
  return {
    modality,
    prompt: clean.slice(0, modality === "voice" ? 280 : 1000),
    reply: `I can request ${MODALITY_META[modality].label.toLowerCase()} for that. Open the studio to see the Celo price before you sign.`,
    source: "keywords",
  };
}

export function planFromModel(text: string): Plan | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const modality = typeof parsed.modality === "string" ? parsed.modality : "";
    const prompt = typeof parsed.prompt === "string" ? parsed.prompt.trim() : "";
    if (!isModality(modality) || !prompt) return null;
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    return {
      modality,
      prompt: prompt.slice(0, modality === "voice" ? 280 : 1000),
      reply: (reply || `Open the studio to review the ${MODALITY_META[modality].label.toLowerCase()} price.`).slice(0, 400),
      source: "grok",
    };
  } catch {
    return null;
  }
}
