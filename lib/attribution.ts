import { codeFromRepo, toDataSuffix } from "@celo/attribution-tags";

const REPO = "0andadream/FLUX";

// One code only. Loops matches the GitHub-repo code and ignores a suffix that also carries another code.
export function attributionCodes() {
  const issued = process.env.NEXT_PUBLIC_ATTRIBUTION_TAG?.trim();
  return [issued || codeFromRepo(REPO)];
}

export function attributionCode() {
  return attributionCodes().join(", ");
}

export function attributionSuffix() {
  return toDataSuffix(attributionCodes());
}
