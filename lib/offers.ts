import { MAX_DOLLAR_ATOMIC, tokenByAddress } from "./celo";

export type PaymentOffer = {
  version: 1 | 2;
  scheme: string;
  network: string;
  amount: string;
  asset: `0x${string}`;
  payTo: `0x${string}`;
  maxTimeoutSeconds: number;
  extra: Record<string, unknown>;
  description: string;
  resource: string;
  mimeType: string;
  tokenSymbol: string;
  tokenLabel: string;
  decimals: number;
  transfer: "eip3009" | "permit2" | "other";
};

const CELO_MAINNET = new Set(["celo", "eip155:42220"]);

type RawAccept = {
  scheme?: string;
  network?: string;
  amount?: string;
  maxAmountRequired?: string;
  asset?: string;
  payTo?: string;
  maxTimeoutSeconds?: number;
  extra?: Record<string, unknown>;
  resource?: string;
  description?: string;
  mimeType?: string;
};

export type Challenge = {
  version: 1 | 2;
  resource: string;
  description: string;
  mimeType: string;
  accepts: RawAccept[];
  extensions: Record<string, unknown>;
};

export function decodeChallenge(status: number, header: string | null, body: unknown): Challenge | null {
  if (status !== 402) return null;
  const fromHeader = header ? safeJson(decodeBase64(header)) : null;
  const doc = isRecord(fromHeader) ? fromHeader : isRecord(body) ? body : null;
  if (!doc) return null;
  const accepts = Array.isArray(doc.accepts) ? (doc.accepts as RawAccept[]) : [];
  const resource = resourceOf(doc.resource);
  return {
    version: doc.x402Version === 1 ? 1 : 2,
    resource: resource.url,
    description: resource.description,
    mimeType: resource.mimeType,
    accepts,
    extensions: isRecord(doc.extensions) ? doc.extensions : {},
  };
}

export type QuotedOffer = PaymentOffer & { accept: Record<string, unknown> };

export function celoOffers(challenge: Challenge): PaymentOffer[] {
  return quotedCeloOffers(challenge).map((quoted) => {
    const { accept, ...offer } = quoted;
    void accept;
    return offer;
  });
}

export function quotedCeloOffers(challenge: Challenge): QuotedOffer[] {
  return challenge.accepts.flatMap((accept) => {
    const offer = normalize(challenge, accept);
    if (!offer) return [];
    if (!CELO_MAINNET.has(offer.network)) return [];
    if (offer.scheme !== "exact") return [];
    if (String(offer.extra.name ?? "") === "GatewayWalletBatched") return [];
    return [{ ...offer, accept: { ...accept } }];
  });
}

export function pickOffer(offers: PaymentOffer[], preferredSymbol: string): PaymentOffer | null {
  const wanted = preferredSymbol.toUpperCase();
  return (
    offers.find((offer) => offer.tokenSymbol.toUpperCase() === wanted && offer.transfer === "eip3009") ??
    offers.find((offer) => offer.tokenSymbol.toUpperCase() === wanted) ??
    offers.find((offer) => offer.transfer === "eip3009") ??
    offers[0] ??
    null
  );
}

const DOLLAR = new Set(["USDC", "USDT", "USAT"]);

export function assertSpendable(offer: PaymentOffer) {
  if (offer.transfer === "other") {
    throw new Error(`${offer.tokenLabel} on this quote uses a transfer Flux cannot sign.`);
  }
  if (DOLLAR.has(offer.tokenSymbol) && BigInt(offer.amount) > MAX_DOLLAR_ATOMIC) {
    throw new Error("This quote is above the $1.00 cap. Shorten the prompt and try again.");
  }
}

function normalize(challenge: Challenge, accept: RawAccept): PaymentOffer | null {
  const amount = accept.amount ?? accept.maxAmountRequired;
  if (!accept.scheme || !accept.network || !amount || !accept.asset || !accept.payTo) return null;
  if (!accept.asset.startsWith("0x") || !accept.payTo.startsWith("0x")) return null;
  const known = tokenByAddress(accept.asset);
  const extra = accept.extra ?? {};
  const method = String(extra.assetTransferMethod ?? "eip3009");
  const transfer = method === "permit2" ? "permit2" : method === "eip3009" ? "eip3009" : "other";
  return {
    version: challenge.version,
    scheme: accept.scheme,
    network: accept.network,
    amount,
    asset: accept.asset as `0x${string}`,
    payTo: accept.payTo as `0x${string}`,
    maxTimeoutSeconds: accept.maxTimeoutSeconds ?? 60,
    extra,
    description: accept.description || challenge.description,
    resource: accept.resource || challenge.resource,
    mimeType: accept.mimeType || challenge.mimeType || "application/json",
    tokenSymbol: known?.symbol ?? "TOKEN",
    tokenLabel: known?.label ?? shortAsset(accept.asset),
    decimals: known?.decimals ?? 6,
    transfer,
  };
}

function resourceOf(value: unknown) {
  if (typeof value === "string") return { url: value, description: "", mimeType: "" };
  if (!isRecord(value)) return { url: "", description: "", mimeType: "" };
  return {
    url: typeof value.url === "string" ? value.url : "",
    description: typeof value.description === "string" ? value.description : "",
    mimeType: typeof value.mimeType === "string" ? value.mimeType : "",
  };
}

function shortAsset(asset: string) {
  return `${asset.slice(0, 6)}…${asset.slice(-4)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function decodeBase64(value: string) {
  const clean = value.trim();
  if (typeof atob === "function") return atob(clean);
  return Buffer.from(clean, "base64").toString("utf8");
}
