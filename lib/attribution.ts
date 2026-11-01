import { codeFromHostname, toDataSuffix } from "@celo/attribution-tags";

const DEFAULT_HOST = "flux.celo.app";

export function attributionCode() {
  const fromEnv = process.env.NEXT_PUBLIC_ATTRIBUTION_TAG?.trim();
  return fromEnv || codeFromHostname(DEFAULT_HOST);
}

export function attributionSuffix() {
  return toDataSuffix(attributionCode());
}
