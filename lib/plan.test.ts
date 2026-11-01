import assert from "node:assert/strict";
import test from "node:test";
import { planFromKeywords, planFromModel } from "./plan.ts";

test("keyword planner maps a song request to the two-step music flow", () => {
  const plan = planFromKeywords("Compose a night song about the rail line");
  assert.equal(plan.modality, "music");
  assert.equal(plan.source, "keywords");
});

test("model planner rejects a modality outside the studio", () => {
  assert.equal(planFromModel('{"modality":"code","prompt":"hack","reply":"no"}'), null);
  const plan = planFromModel('Here you go {"modality":"image","prompt":"black angular mark","reply":"A still."}');
  assert.equal(plan?.modality, "image");
  assert.equal(plan?.source, "grok");
});
