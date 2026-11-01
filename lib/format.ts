export function shortAddress(address: string, size = 4) {
  if (!address.startsWith("0x") || address.length < 10) return address;
  return `${address.slice(0, 2 + size)}…${address.slice(-size)}`;
}

export function formatAtomic(amount: string, decimals: number) {
  const negative = amount.startsWith("-");
  const digits = negative ? amount.slice(1) : amount;
  if (!/^\d+$/.test(digits)) return amount;
  const padded = digits.padStart(decimals + 1, "0");
  const whole = padded.slice(0, padded.length - decimals);
  const frac = padded.slice(padded.length - decimals).replace(/0+$/, "");
  const text = frac ? `${whole}.${frac}` : whole;
  return negative ? `-${text}` : text;
}

export function formatUsd(amount: string, decimals = 6) {
  return `$${formatAtomic(amount, decimals)}`;
}

export function celoScanTx(hash: string) {
  return `https://celoscan.io/tx/${hash}`;
}

export function celoScanAddress(address: string) {
  return `https://celoscan.io/address/${address}`;
}

export function agentScan(agentId: string) {
  return `https://8004scan.io/agents/celo/${agentId}`;
}
