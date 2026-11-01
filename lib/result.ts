export type Presented =
  | { kind: "image"; src: string; caption?: string }
  | { kind: "audio"; src: string; caption?: string }
  | { kind: "video"; src: string; caption?: string }
  | { kind: "text"; text: string };

const MEDIA_KEYS = ["image", "b64_json", "audio", "video", "mp4", "revised_prompt"];

export function presentResult(payload: unknown): Presented {
  const media = findMedia(payload);
  if (media) return media;
  const text = findText(payload);
  if (text) return { kind: "text", text };
  return { kind: "text", text: "The service returned a response with no displayable media." };
}

export function parseComposition(payload: unknown): {
  title: string;
  bpm: string;
  key: string;
  lyrics: string;
  vocal: string;
} | null {
  const text = findText(payload);
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const vocal = stringField(parsed.vocal) || stringField(parsed.lyrics).slice(0, 220);
    if (!vocal) return null;
    return {
      title: stringField(parsed.title) || "Untitled",
      bpm: parsed.bpm === undefined ? "" : String(parsed.bpm),
      key: stringField(parsed.key),
      lyrics: stringField(parsed.lyrics),
      vocal,
    };
  } catch {
    return null;
  }
}

function findMedia(value: unknown, depth = 0): Presented | null {
  if (depth > 6 || value == null) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findMedia(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const caption =
    stringField(record.revised_prompt) || stringField(record.title) || undefined;
  for (const key of MEDIA_KEYS) {
    const raw = record[key];
    if (typeof raw !== "string" || raw.length < 32) continue;
    if (key === "revised_prompt") continue;
    const presented = asMedia(key, raw, caption);
    if (presented) return presented;
  }
  for (const nested of Object.values(record)) {
    const found = findMedia(nested, depth + 1);
    if (found) return found;
  }
  return null;
}

function asMedia(key: string, raw: string, caption?: string): Presented | null {
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    if (key === "video" || key === "mp4") return { kind: "video", src: raw, caption };
    if (key === "audio") return { kind: "audio", src: raw, caption };
    if (key === "image" || key === "b64_json") return { kind: "image", src: raw, caption };
  }
  const dataUrl = raw.startsWith("data:") ? raw : null;
  if (dataUrl?.startsWith("data:image")) return { kind: "image", src: dataUrl, caption };
  if (dataUrl?.startsWith("data:audio")) return { kind: "audio", src: dataUrl, caption };
  if (dataUrl?.startsWith("data:video")) return { kind: "video", src: dataUrl, caption };
  if (raw.length < 80) return null;
  if (key === "audio") return { kind: "audio", src: `data:audio/mpeg;base64,${raw}`, caption };
  if (key === "video" || key === "mp4") return { kind: "video", src: `data:video/mp4;base64,${raw}`, caption };
  if (key === "image" || key === "b64_json") return { kind: "image", src: `data:image/png;base64,${raw}`, caption };
  return null;
}

function findText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const choice = record.choices;
  if (Array.isArray(choice) && choice[0] && typeof choice[0] === "object") {
    const message = (choice[0] as { message?: { content?: unknown } }).message;
    if (typeof message?.content === "string") return message.content;
  }
  if (typeof record.output_text === "string") return record.output_text;
  if (typeof record.content === "string" && record.content.length > 0 && record.content.length < 20_000) {
    return record.content;
  }
  if (record.output && typeof record.output === "object") return findText(record.output);
  return "";
}

function stringField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
