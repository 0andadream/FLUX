const KEY = "flux.token.v1";
const EVENT = "flux-token";

export function readPreferredToken() {
  if (typeof window === "undefined") return "USAT";
  return window.localStorage.getItem(KEY) || "USAT";
}

export function subscribePreferredToken(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function writePreferredToken(symbol: string) {
  window.localStorage.setItem(KEY, symbol);
  window.dispatchEvent(new Event(EVENT));
}
