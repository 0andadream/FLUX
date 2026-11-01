# Flux

Flux is a studio for the Celo Agents on Open Rails hackathon, Build with buy track. A person asks for an image, a video, a voice line, or a composition. Flux fetches a live price, the wallet signs a Celo stablecoin authorization, and the service returns the result after the payment settles.

## What is paid, and where

| Request | Seller | Rail | What you get |
| --- | --- | --- | --- |
| Image | [agent402](https://agent402.tools) `POST /api/image-gen` | x402 on Celo | One image |
| Video | agent402 `POST /v1/videos/generations` | x402 on Celo | A short clip |
| Voice | agent402 `POST /api/tts` | x402 on Celo | Speech, priced from the text |
| Music, step 1 | [buy.ai](https://gateway.usebuy.ai) Cencori `maximo-atlas-1.3` | buy.ai / x402 v1 on Celo | A score: title, tempo, key, lyrics, and one vocal line |
| Music, step 2 | agent402 text to speech | x402 on Celo | That vocal line, spoken |

buy.ai’s catalog does not sell image, video, music, or voice generation. Flux does not pretend an unpaid model call is an x402 purchase. Music is two approvals on purpose. The composition can settle in USDC, USD₮, or USA₮ when the live quote lists them. The media service’s quotes, checked while building Flux, list Celo USDC. The token picker only shows assets in the current 402 response. Local stables such as wARS are supported by the signer only if a quote lists them.

The price is the 402 response for that exact request, not a number baked into the app. Flux refuses a USDC, USD₮, or USA₮ quote above $1.

## Contracts

Celo mainnet, chain id `42220`.

| Record | Address |
| --- | --- |
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| ERC-8004 Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` |
| USDC (EIP-3009, 6 decimals) | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` |
| USD₮ (EIP-3009, 6 decimals) | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` |
| USA₮ (EIP-3009, 6 decimals) | `0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771` |
| buy.ai payee seen on quotes | `0x20faAca5F980E29639A0FCC6dcA6988E18ed333B` |
| agent402 payee seen on quotes | `0xaBF4FAbd7c416fB67202E5f9002389Fc75e2a9D0` |

The payee on screen is the one in the live quote. The two payee addresses above are what those services returned on 2026-11-01.

Flux does not ship with an agent id. Settings → Register on Celo mints the ERC-8004 NFT to the connected wallet. Read the id from the `Registered` event, or from the receipt link the page stores in this browser. Set `NEXT_PUBLIC_AGENT_ID` afterwards so `/agent-registration.json` includes the `registrations` entry. `x402Support` is `false` because Flux’s own routes do not accept payment.

## Attribution

Registration and URI updates append an ERC-8021 suffix from `@celo/attribution-tags`. The default code is `codeFromHostname("flux.celo.app")`. Override it with `NEXT_PUBLIC_ATTRIBUTION_TAG`.

Facilitator-submitted x402 settlements do not carry that suffix yet. For those payments, judges should use the buyer address, the payee, and the transaction hash in the `PAYMENT-RESPONSE` header. Flux shows that hash on the result and on Activity.

## Setup

```bash
cd Flux
npm install
cp .env.example .env.local
```

Put a WalletConnect Cloud project id in `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` if you want WalletConnect. MetaMask and MiniPay work through the injected connector without it.

Optional: `XAI_API_KEY` lets the Agent page ask Grok (`grok-4.7` on `https://api.x.ai/v1/responses`) for a plan. The key stays on the server. Without it, the page plans from the wording of the request and says so. The agent never signs a payment.

```bash
npm run dev
```

Open http://localhost:3000. Connect a wallet on Celo mainnet with a little CELO for the identity registration and some USDC (and USD₮ or USA₮ if you want the buy.ai choice).

## How to judge a payment

1. Connect a Celo wallet and open Studio.
2. Enter a short prompt. Image and voice are the small purchases. Video is a flat higher quote and can take a few minutes.
3. Choose Get price. The panel shows the amount, token, payee, and network. Nothing is signed yet.
4. Choose Approve and generate and sign the wallet request. That signature is an EIP-3009 authorization. The facilitator submits the settlement and pays its gas.
5. The result appears after the service answers. Activity stores the row only when the response includes a transaction hash.
6. Open the hash on [Celoscan](https://celoscan.io). The payer in the activity row is the connected wallet. The payee should match the quote.
7. For music, the first result is the score. Price the vocal is a second, separate payment.
8. To verify identity, deploy the app on a public HTTPS origin, register from Settings, and open the agent on [8004scan](https://8004scan.io). The registration transaction’s input ends with the attribution suffix. A localhost URI is a poor registration target.

If a paid call times out, do not sign again until you have checked Celoscan. The settlement may already exist, and a second signature can pay twice. Flux does not retry a paid request on its own.

## Scripts

```bash
npm test
npm run lint
npm run build
```

`npm test` signs payment headers locally with a public test key. It does not broadcast a transaction.

## Layout

- `app/` pages: landing, studio, activity, agent, settings, plus the quote, settle, and agent routes.
- `lib/offers.ts` keeps only exact Celo accepts and drops batched gateway offers.
- `lib/pay.ts` signs with the official `@x402/evm` client, one chosen accept at a time, so a Base quote cannot be selected by accident.
- `lib/modalities.ts` is the only place that builds a seller request. The server rebuilds that same request at settle time.
- Quote and settle proxy only `gateway.usebuy.ai` and `agent402.tools`, and they refuse redirects.

The app was not submitted with a pre-recorded settlement. A payment counts when the connected wallet produces a hash.
