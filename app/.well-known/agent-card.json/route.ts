export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return Response.json({
    name: "Flux",
    description:
      "Proposes image, video, music, and voice generation. Payment is a Celo stablecoin authorization the person signs in the studio.",
    url: origin,
    version: "0.1.0",
    capabilities: { streaming: false },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain", "image/png", "audio/mpeg", "video/mp4"],
    skills: [
      {
        id: "generate",
        name: "Generate",
        description: "Turn a request into a prompt and a generation type. The studio quotes the price before anyone pays.",
        tags: ["image", "video", "music", "voice", "celo", "x402"],
      },
    ],
  });
}
