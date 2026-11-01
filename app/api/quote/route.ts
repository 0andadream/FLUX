import { buildRequest, isModality } from "@/lib/modalities";
import { decodeChallenge, quotedCeloOffers } from "@/lib/offers";
import { callUpstream, jsonError, parseJson, readJson } from "@/lib/upstream";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const modality = typeof body.modality === "string" ? body.modality : "";
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    if (!isModality(modality)) throw new Error("Choose image, video, music, or voice.");
    if (prompt.trim().length > 2000) throw new Error("That prompt is too long.");
    const paid = buildRequest(modality, prompt);
    const upstream = await callUpstream(paid.url, paid.body, {}, 25_000);
    const parsed = parseJson(upstream.text);
    const challenge = decodeChallenge(upstream.status, upstream.header("payment-required"), parsed);
    if (!challenge) {
      throw new Error(
        upstream.status === 200
          ? "The service returned a result without asking for payment. Flux did not treat that as a purchase."
          : `The service did not return a payment quote (${upstream.status}).`,
      );
    }
    const offers = quotedCeloOffers(challenge);
    if (offers.length === 0) {
      return Response.json(
        { error: "This service did not offer an exact Celo payment Flux can sign." },
        { status: 409 },
      );
    }
    return Response.json({
      modality: paid.modality,
      rail: paid.rail,
      service: paid.service,
      note: paid.note,
      url: paid.url,
      version: challenge.version,
      resource: challenge.resource,
      description: challenge.description,
      mimeType: challenge.mimeType,
      extensions: challenge.extensions,
      offers,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return jsonError(timedOut ? "The price request timed out. Try again." : error, timedOut ? 504 : 400);
  }
}
