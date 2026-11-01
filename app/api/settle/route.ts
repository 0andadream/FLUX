import { buildRequest, isModality } from "@/lib/modalities";
import { settlementFromHeader } from "@/lib/receipt";
import { callUpstream, jsonError, parseJson, readJson } from "@/lib/upstream";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const TIMEOUT_MESSAGE =
  "The paid call timed out. Do not sign again yet. Check Celoscan for a settlement from your address first. A second signature can pay twice.";

export async function POST(request: Request) {
  try {
    const body = await readJson(request, 48_000);
    const modality = typeof body.modality === "string" ? body.modality : "";
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    if (!isModality(modality)) throw new Error("Choose image, video, music, or voice.");
    if (prompt.trim().length > 2000) throw new Error("That prompt is too long.");
    const headers = paymentHeaders(body.headers);
    const paid = buildRequest(modality, prompt);
    const upstream = await callUpstream(paid.url, paid.body, headers, 240_000);
    const settlement = settlementFromHeader(
      upstream.header("payment-response") || upstream.header("x-payment-response"),
    );
    return Response.json({
      status: upstream.status,
      body: parseJson(upstream.text),
      settlement,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return jsonError(timedOut ? TIMEOUT_MESSAGE : error, timedOut ? 504 : 400);
  }
}

function paymentHeaders(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Missing the payment signature.");
  }
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    const name = key.toLowerCase();
    if (name !== "payment-signature" && name !== "x-payment") {
      throw new Error("Flux only forwards the x402 payment header.");
    }
    if (typeof raw !== "string" || raw.length < 20 || raw.length > 20_000) {
      throw new Error("The payment header is missing or too large.");
    }
    out[name === "x-payment" ? "X-PAYMENT" : "PAYMENT-SIGNATURE"] = raw;
  }
  if (Object.keys(out).length === 0) throw new Error("Missing the payment signature.");
  return out;
}
