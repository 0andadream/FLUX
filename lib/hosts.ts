import { ALLOWED_HOSTS } from "@/lib/celo";

export function assertAllowedUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("That address is not a URL.");
  }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    throw new Error("Flux only calls buy.ai and the Celo x402 media service.");
  }
  if (url.username || url.password || (url.port !== "" && url.port !== "443")) {
    throw new Error("Flux only calls buy.ai and the Celo x402 media service.");
  }
  return url;
}
