import { IDENTITY_REGISTRY } from "./celo";

export const identityAbi = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    type: "function",
    name: "setAgentURI",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "newURI", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "Registered",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "agentURI", type: "string" },
      { name: "owner", type: "address", indexed: true },
    ],
  },
] as const;

export const identityRegistry = IDENTITY_REGISTRY;

export type IdentityRecord = {
  agentId: string;
  uri: string;
  txHash: string;
  owner: string;
};

const KEY = "flux.identity.v1";
const EVENT = "flux-identity";

export function identitySnapshot() {
  return window.localStorage.getItem(KEY) ?? "";
}

export function subscribeIdentity(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function readIdentity(): IdentityRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as IdentityRecord | null;
    if (!parsed || typeof parsed.agentId !== "string" || typeof parsed.txHash !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeIdentity(record: IdentityRecord) {
  window.localStorage.setItem(KEY, JSON.stringify(record));
  window.dispatchEvent(new Event(EVENT));
  return record;
}
