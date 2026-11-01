import { x402Client, x402HTTPClient, type SpendControlAsset } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import type { PaymentRequired } from "@x402/core/types";
import { CELO_RPC, LOCAL_STABLES, TOKENS } from "./celo";
import { assertSpendable, type PaymentOffer } from "./offers";

type TypedSigner = {
  address: `0x${string}`;
  signTypedData: (message: {
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
  }) => Promise<`0x${string}`>;
};

export async function createPaymentHeader(signer: TypedSigner, offer: PaymentOffer, accept: Record<string, unknown>, extensions: Record<string, unknown>) {
  assertOfferMatchesAccept(offer, accept);
  assertSpendable(offer);
  const client = new x402Client();
  client.setSpendControls({
    maxAmountPerPayment: "$1",
    allowedAssets: spendAssets(),
  });
  registerExactEvmScheme(client, {
    signer,
    schemeOptions: { rpcUrl: CELO_RPC },
    paymentRequirementsSelector: (_version, requirements) => requirements[0],
  });
  const http = new x402HTTPClient(client);
  const paymentRequired = {
    x402Version: offer.version,
    error: offer.version === 1 ? "payment_required" : "Payment required",
    resource:
      offer.version === 2
        ? {
            url: offer.resource || accept.resource,
            description: offer.description,
            mimeType: offer.mimeType || "application/json",
          }
        : offer.resource,
    accepts: [accept],
    extensions,
  } as PaymentRequired;
  const payload = await client.createPaymentPayload(paymentRequired);
  return http.encodePaymentSignatureHeader(payload);
}

export function assertOfferMatchesAccept(offer: PaymentOffer, accept: Record<string, unknown>) {
  const amount = stringField(accept.amount) || stringField(accept.maxAmountRequired);
  const payTo = stringField(accept.payTo);
  const asset = stringField(accept.asset);
  const network = stringField(accept.network);
  const scheme = stringField(accept.scheme);
  if (
    scheme !== "exact" ||
    amount !== offer.amount ||
    network !== offer.network ||
    payTo.toLowerCase() !== offer.payTo.toLowerCase() ||
    asset.toLowerCase() !== offer.asset.toLowerCase()
  ) {
    throw new Error("The quote on screen does not match the payment to sign. Request a new price.");
  }
}

function spendAssets(): SpendControlAsset[] {
  const rows: SpendControlAsset[] = [
    ...Object.values(TOKENS).map((token) => cap("eip155:42220", token.address, "1000000")),
    ...LOCAL_STABLES.map((token) =>
      cap(
        "eip155:42220",
        token.address,
        token.decimals === 18 ? (BigInt(10) ** BigInt(21)).toString() : "2000000000",
      ),
    ),
  ];
  return [...rows, ...rows.map((row) => ({ ...row, network: "celo" as unknown as SpendControlAsset["network"] }))];
}

function cap(network: "eip155:42220", asset: string, maxAmountPerPayment: string): SpendControlAsset {
  return { network, asset, maxAmountPerPayment };
}

function stringField(value: unknown) {
  return typeof value === "string" ? value : "";
}
