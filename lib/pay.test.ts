import assert from "node:assert/strict";
import test from "node:test";
import { privateKeyToAccount } from "viem/accounts";
import { createPaymentHeader } from "./pay.ts";
import type { PaymentOffer } from "./offers.ts";

const account = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
const signer = {
  address: account.address,
  signTypedData: (message: {
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
  }) => account.signTypedData(message as never),
};

const usat = "0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771";
const usdc = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
const buyPayTo = "0x20faAca5F980E29639A0FCC6dcA6988E18ed333B";
const mediaPayTo = "0xaBF4FAbd7c416fB67202E5f9002389Fc75e2a9D0";

test("v1 buy quote signs an X-PAYMENT header for USA₮ on Celo", async () => {
  const accept = {
    scheme: "exact",
    network: "celo",
    maxAmountRequired: "10000",
    resource: "https://gateway.usebuy.ai/cencori/v1/chat/completions",
    description: "Cencori completion",
    mimeType: "application/json",
    payTo: buyPayTo,
    maxTimeoutSeconds: 60,
    asset: usat,
    extra: { name: "Tether America USD", version: "1" },
  };
  const offer: PaymentOffer = {
    version: 1,
    scheme: "exact",
    network: "celo",
    amount: "10000",
    asset: usat,
    payTo: buyPayTo,
    maxTimeoutSeconds: 60,
    extra: accept.extra,
    description: accept.description,
    resource: accept.resource,
    mimeType: "application/json",
    tokenSymbol: "USAT",
    tokenLabel: "USA₮",
    decimals: 6,
    transfer: "eip3009",
  };
  const headers = await createPaymentHeader(signer, offer, accept, {});
  assert.equal(headers["PAYMENT-SIGNATURE"], undefined);
  const payload = JSON.parse(Buffer.from(headers["X-PAYMENT"], "base64").toString("utf8")) as {
    x402Version: number;
    scheme: string;
    network: string;
    payload: { authorization: { from: string; to: string; value: string }; signature: string };
  };
  assert.equal(payload.x402Version, 1);
  assert.equal(payload.scheme, "exact");
  assert.equal(payload.network, "celo");
  assert.equal(payload.payload.authorization.value, "10000");
  assert.equal(payload.payload.authorization.to.toLowerCase(), buyPayTo.toLowerCase());
  assert.equal(payload.payload.authorization.from.toLowerCase(), account.address.toLowerCase());
  assert.match(payload.payload.signature, /^0x[0-9a-f]+$/i);
});

test("v2 media quote signs a PAYMENT-SIGNATURE header for Celo USDC", async () => {
  const accept = {
    scheme: "exact",
    network: "eip155:42220",
    amount: "30000",
    asset: usdc,
    payTo: mediaPayTo,
    maxTimeoutSeconds: 60,
    extra: { name: "USDC", version: "2", assetTransferMethod: "eip3009" },
  };
  const offer: PaymentOffer = {
    version: 2,
    scheme: "exact",
    network: "eip155:42220",
    amount: "30000",
    asset: usdc,
    payTo: mediaPayTo,
    maxTimeoutSeconds: 60,
    extra: accept.extra,
    description: "Image",
    resource: "https://agent402.tools/api/image-gen",
    mimeType: "application/json",
    tokenSymbol: "USDC",
    tokenLabel: "USDC",
    decimals: 6,
    transfer: "eip3009",
  };
  const headers = await createPaymentHeader(signer, offer, accept, {});
  assert.equal(headers["X-PAYMENT"], undefined);
  const payload = JSON.parse(Buffer.from(headers["PAYMENT-SIGNATURE"], "base64").toString("utf8")) as {
    x402Version: number;
    accepted: { payTo: string; amount: string; network: string };
    payload: { signature: string };
  };
  assert.equal(payload.x402Version, 2);
  assert.equal(payload.accepted.network, "eip155:42220");
  assert.equal(payload.accepted.amount, "30000");
  assert.equal(payload.accepted.payTo.toLowerCase(), mediaPayTo.toLowerCase());
  assert.match(payload.payload.signature, /^0x[0-9a-f]+$/i);
});
