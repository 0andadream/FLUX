export type Settlement = {
  success: boolean;
  transaction: string;
  payer: string;
  network: string;
  error: string;
};

export function settlementFromHeader(value: string | null): Settlement | null {
  if (!value) return null;
  const parsed = parseHeader(value);
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;
  const transaction = stringField(record.transaction) || stringField(record.txHash);
  return {
    success: record.success !== false && Boolean(transaction),
    transaction,
    payer: stringField(record.payer),
    network: stringField(record.network),
    error: stringField(record.errorMessage) || stringField(record.errorReason) || stringField(record.error),
  };
}

function parseHeader(value: string): unknown {
  const trimmed = value.trim();
  try {
    if (trimmed.startsWith("{")) return JSON.parse(trimmed) as unknown;
    const decoded = typeof atob === "function" ? atob(trimmed) : Buffer.from(trimmed, "base64").toString("utf8");
    return JSON.parse(decoded) as unknown;
  } catch {
    return null;
  }
}

function stringField(value: unknown) {
  return typeof value === "string" ? value : "";
}
