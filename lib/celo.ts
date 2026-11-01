export const CELO_MAINNET_ID = 42220;
export const CELO_SEPOLIA_ID = 11142220;

export const CELO_RPC =
  process.env.NEXT_PUBLIC_CELO_RPC ?? "https://forno.celo.org";

export const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;

/** Celo fee-abstraction adapter for USDC gas. This is not the EIP-3009 USDC token. */
export const USDC_FEE_ADAPTER = "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B" as const;
export const REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as const;

/** Seller receiving addresses observed on 2026-11-01. A live quote is authoritative. */
export const KNOWN_PAYTO = {
  buy: "0x20faAca5F980E29639A0FCC6dcA6988E18ed333B",
  agent402: "0xaBF4FAbd7c416fB67202E5f9002389Fc75e2a9D0",
} as const;

export const TOKENS = {
  USDC: {
    symbol: "USDC",
    label: "USDC",
    address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    decimals: 6,
    eip712Name: "USDC",
    eip712Version: "2",
  },
  USDT: {
    symbol: "USDT",
    label: "USD₮",
    address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    decimals: 6,
    eip712Name: "Tether USD",
    eip712Version: "1",
  },
  USAT: {
    symbol: "USAT",
    label: "USA₮",
    address: "0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771",
    decimals: 6,
    eip712Name: "Tether America USD",
    eip712Version: "1",
  },
} as const;

export type TokenSymbol = keyof typeof TOKENS;

export const LOCAL_STABLES = [
  { symbol: "wARS", label: "wARS", address: "0x0DC4F92879B7670e5f4e4e6e3c801D229129D90D", decimals: 18 },
  { symbol: "wBRL", label: "wBRL", address: "0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0", decimals: 18 },
  { symbol: "wMXN", label: "wMXN", address: "0x337E7456B420bD3481e7FA61fA9850343d610d34", decimals: 18 },
  { symbol: "wCOP", label: "wCOP", address: "0x8a1D45e102e886510e891d2Ec656a708991e2D76", decimals: 18 },
  { symbol: "wPEN", label: "wPEN", address: "0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE", decimals: 18 },
  { symbol: "wCLP", label: "wCLP", address: "0x61D450a098b6a7f69fC4b98CE68198fe59768651", decimals: 18 },
  { symbol: "cNGN", label: "cNGN", address: "0xF6829D7393dAe24509eb1E52eE8e572e2E271a4f", decimals: 6 },
] as const;

export const ALLOWED_HOSTS = new Set(["gateway.usebuy.ai", "agent402.tools"]);

/** Refuse a quote above this many base units of a 6-decimal dollar stable ($1.00). */
export const MAX_DOLLAR_ATOMIC = BigInt(1_000_000);

export function tokenByAddress(address: string) {
  const lower = address.toLowerCase();
  const dollar = Object.values(TOKENS).find((token) => token.address.toLowerCase() === lower);
  if (dollar) return dollar;
  return LOCAL_STABLES.find((token) => token.address.toLowerCase() === lower) ?? null;
}
