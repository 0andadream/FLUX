import { IDENTITY_REGISTRY } from "@/lib/celo";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const agentId = process.env.NEXT_PUBLIC_AGENT_ID?.trim();
  const id = agentId && /^\d+$/.test(agentId) ? Number(agentId) : null;
  return Response.json({
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: "Flux",
    description:
      "Flux is a studio that buys image, video, voice, and composition from paid agents. The person approves each Celo stablecoin authorization. Flux does not accept x402 on its own endpoints.",
    image: `${origin}/mark.svg`,
    services: [
      { name: "web", endpoint: origin },
      {
        name: "A2A",
        endpoint: `${origin}/.well-known/agent-card.json`,
        version: "0.3.0",
      },
    ],
    x402Support: false,
    active: true,
    supportedTrust: ["reputation"],
    registrations: id
      ? [{ agentId: id, agentRegistry: `eip155:42220:${IDENTITY_REGISTRY}` }]
      : [],
  });
}
