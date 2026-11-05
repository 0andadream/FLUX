import { toDataSuffix } from "@celo/attribution-tags";

// The code Loops issued for this entry. A repo-derived code is a different value.
const ISSUED = "celo_9f870c6e79fb";

export function attributionCodes() {
  const issued = process.env.NEXT_PUBLIC_ATTRIBUTION_TAG?.trim();
  return [issued || ISSUED];
}

export function attributionCode() {
  return attributionCodes().join(", ");
}

export function attributionSuffix() {
  return toDataSuffix(attributionCodes());
}
