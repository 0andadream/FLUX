/** RainbowKit pulls an optional Solana signer. Flux never calls it. */
export class ExactSvmScheme {
  constructor(..._args: unknown[]) {
    void _args;
  }
}

export function registerExactSvmScheme(): never {
  throw new Error("Flux does not sign Solana payments.");
}
