import { assertAllowedUrl } from "./hosts";

const MAX_RESPONSE_CHARS = 20_000_000;

export async function callUpstream(url: string, body: unknown, headers: Record<string, string>, timeoutMs: number) {
  const allowed = assertAllowedUrl(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(allowed, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
    });
    if (response.status >= 300 && response.status < 400) {
      throw new Error("The service tried to redirect. Flux stopped.");
    }
    const text = await response.text();
    if (text.length > MAX_RESPONSE_CHARS) {
      throw new Error("The service response is too large to display.");
    }
    return { status: response.status, text, header: (name: string) => response.headers.get(name) };
  } finally {
    clearTimeout(timer);
  }
}

export function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text.slice(0, 4000) };
  }
}

export async function readJson(request: Request, max = 32_000) {
  const text = await request.text();
  if (text.length > max) throw new Error("That request is too large.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Expected JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

export function jsonError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Request failed.";
  return Response.json({ error: message }, { status });
}
