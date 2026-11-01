export type Activity = {
  id: string;
  at: string;
  modality: string;
  service: string;
  prompt: string;
  token: string;
  amount: string;
  decimals: number;
  txHash: string;
  payer: string;
  payTo: string;
  network: string;
  resource: string;
};

const KEY = "flux.activity.v1";
const EVENT = "flux-activity";

export function activitySnapshot() {
  return window.localStorage.getItem(KEY) ?? "[]";
}

export function subscribeActivity(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function readActivity(): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Activity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeActivity(entry: Activity) {
  const next = [entry, ...readActivity()].slice(0, 50);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
  return next;
}
