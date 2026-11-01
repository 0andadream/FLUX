import assert from "node:assert/strict";
import test from "node:test";
import { settlementFromHeader } from "./receipt.ts";

test("reads a base64 payment response", () => {
  const payload = {
    success: true,
    transaction: "0xabc",
    payer: "0x1111111111111111111111111111111111111111",
    network: "eip155:42220",
  };
  const header = Buffer.from(JSON.stringify(payload)).toString("base64");
  const settlement = settlementFromHeader(header);
  assert.equal(settlement?.transaction, "0xabc");
  assert.equal(settlement?.success, true);
  assert.equal(settlement?.network, "eip155:42220");
});

test("a missing header is not a settlement", () => {
  assert.equal(settlementFromHeader(null), null);
});
