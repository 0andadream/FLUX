import assert from "node:assert/strict";
import test from "node:test";
import { parseComposition, presentResult } from "./result.ts";

test("presents a base64 image field", () => {
  const presented = presentResult({ image: "a".repeat(120), revised_prompt: "a black F" });
  assert.equal(presented.kind, "image");
  if (presented.kind === "image") {
    assert.match(presented.src, /^data:image\/png;base64,/);
    assert.equal(presented.caption, "a black F");
  }
});

test("reads a Cencori composition", () => {
  const payload = {
    choices: [
      {
        message: {
          content: 'Sure\n{"title":"Night Rail","bpm":96,"key":"D minor","lyrics":"line","vocal":"Night rail, keep the light"}',
        },
      },
    ],
  };
  const composition = parseComposition(payload);
  assert.equal(composition?.title, "Night Rail");
  assert.equal(composition?.vocal, "Night rail, keep the light");
});
