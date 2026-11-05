import { codeFromHostname, codeFromRepo, toDataSuffix } from "@celo/attribution-tags";

const REPO = "0andadream/FLUX";
const HOST = "flux.celo.app";

// Loops credits the code derived from the GitHub repo. The hostname code stays on the same suffix.
export function attributionCodes() {
  const issued = process.env.NEXT_PUBLIC_ATTRIBUTION_TAG?.trim();
  const codes = [codeFromRepo(REPO), codeFromHostname(HOST)];
  if (issued && !codes.includes(issued)) codes.unshift(issued);
  return codes;
}

export function attributionCode() {
  return attributionCodes().join(", ");
}

export function attributionSuffix() {
  return toDataSuffix(attributionCodes());
}
