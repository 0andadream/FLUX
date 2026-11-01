import assert from "node:assert/strict";
import test from "node:test";
import { celoOffers, decodeChallenge, pickOffer } from "./offers.ts";

const challenge = {
  x402Version: 2,
  error: "Payment required",
  resource: { url: "https://agent402.tools/api/image-gen", description: "Image", mimeType: "application/json" },
  accepts: [
    {
      scheme: "exact",
      network: "eip155:8453",
      amount: "30000",
      asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      payTo: "0xaBF4FAbd7c416fB67202E5f9002389Fc75e2a9D0",
      maxTimeoutSeconds: 300,
      extra: { name: "USD Coin", version: "2" },
    },
    {
      scheme: "exact",
      network: "eip155:42220",
      amount: "30000",
      asset: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
      payTo: "0xaBF4FAbd7c416fB67202E5f9002389Fc75e2a9D0",
      maxTimeoutSeconds: 300,
      extra: { name: "USDC", version: "2" },
    },
    {
      scheme: "exact",
      network: "eip155:42220",
      amount: "30000",
      asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      payTo: "0xaBF4FAbd7c416fB67202E5f9002389Fc75e2a9D0",
      maxTimeoutSeconds: 604900,
      extra: { name: "GatewayWalletBatched", version: "1" },
    },
    {
      scheme: "upto",
      network: "eip155:42220",
      amount: "30000",
      asset: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
      payTo: "0xaBF4FAbd7c416fB67202E5f9002389Fc75e2a9D0",
      extra: { name: "USDC", version: "2", assetTransferMethod: "permit2" },
    },
  ],
};

test("keeps the Celo exact USDC offer and drops Base, batched, and upto", () => {
  const decoded = decodeChallenge(402, null, challenge);
  assert.ok(decoded);
  const offers = celoOffers(decoded);
  assert.equal(offers.length, 1);
  assert.equal(offers[0]?.network, "eip155:42220");
  assert.equal(offers[0]?.tokenSymbol, "USDC");
  assert.equal(offers[0]?.transfer, "eip3009");
});

test("buy v1 body uses maxAmountRequired and the celo network name", () => {
  const body = {
    x402Version: 1,
    error: "payment_required",
    accepts: [
      {
        scheme: "exact",
        network: "celo",
        maxAmountRequired: "10000",
        resource: "https://gateway.usebuy.ai/cencori/v1/chat/completions",
        description: "Chat",
        mimeType: "application/json",
        payTo: "0x20faAca5F980E29639A0FCC6dcA6988E18ed333B",
        maxTimeoutSeconds: 60,
        asset: "0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771",
        extra: { name: "Tether America USD", version: "1" },
      },
      {
        scheme: "exact",
        network: "celo",
        maxAmountRequired: "10000",
        payTo: "0x20faAca5F980E29639A0FCC6dcA6988E18ed333B",
        asset: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
        extra: { name: "USDC", version: "2" },
      },
    ],
  };
  const decoded = decodeChallenge(402, null, body);
  assert.ok(decoded);
  const offers = celoOffers(decoded);
  const picked = pickOffer(offers, "USAT");
  assert.equal(picked?.tokenSymbol, "USAT");
  assert.equal(picked?.amount, "10000");
  assert.equal(picked?.version, 1);
});

test("a non-402 is not a challenge", () => {
  assert.equal(decodeChallenge(200, null, { ok: true }), null);
});
