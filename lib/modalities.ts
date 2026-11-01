export type Modality = "image" | "video" | "music" | "voice";

export const MODALITIES: Modality[] = ["image", "video", "music", "voice"];

export function isModality(value: string | null): value is Modality {
  return value === "image" || value === "video" || value === "music" || value === "voice";
}

export type PaidRequest = {
  modality: Modality;
  rail: "buy" | "x402";
  service: string;
  url: string;
  method: "POST";
  body: Record<string, unknown>;
  note: string;
};

const BUY_COMPOSE = "https://gateway.usebuy.ai/cencori/v1/chat/completions";

export const MODALITY_META: Record<
  Modality,
  { label: string; blurb: string; service: string }
> = {
  image: {
    label: "Image",
    blurb: "A still, paid per picture.",
    service: "agent402 image generation",
  },
  video: {
    label: "Video",
    blurb: "A four-second clip, flat price.",
    service: "agent402 video generation",
  },
  music: {
    label: "Music",
    blurb: "A score from buy.ai, then a vocal.",
    service: "buy.ai Cencori + x402 voice",
  },
  voice: {
    label: "Voice",
    blurb: "Speech priced from the text.",
    service: "agent402 text to speech",
  },
};

export function buildRequest(modality: Modality, prompt: string): PaidRequest {
  const text = prompt.trim();
  if (!text) throw new Error("Enter a prompt first.");
  if (modality === "image") {
    return {
      modality,
      rail: "x402",
      service: MODALITY_META.image.service,
      url: "https://agent402.tools/api/image-gen",
      method: "POST",
      body: { prompt: text.slice(0, 1000) },
      note: "One Celo stablecoin authorization. The 402 quote is the price.",
    };
  }
  if (modality === "video") {
    return {
      modality,
      rail: "x402",
      service: MODALITY_META.video.service,
      url: "https://agent402.tools/v1/videos/generations",
      method: "POST",
      body: { prompt: text.slice(0, 1000), aspect_ratio: "16:9" },
      note: "One Celo stablecoin authorization for a short clip.",
    };
  }
  if (modality === "voice") {
    return {
      modality,
      rail: "x402",
      service: MODALITY_META.voice.service,
      url: "https://agent402.tools/api/tts",
      method: "POST",
      body: { text: text.slice(0, 280), voice: "alloy", format: "mp3" },
      note: "Priced from the length of the text. Flux sends at most 280 characters.",
    };
  }
  return {
    modality,
    rail: "buy",
    service: "buy.ai · Cencori maximo-atlas-1.3",
    url: BUY_COMPOSE,
    method: "POST",
    body: {
      model: "maximo-atlas-1.3",
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [
            "You compose for Flux. Reply with one JSON object and no markdown.",
            'Keys: "title" string, "bpm" number, "key" string, "lyrics" string, "vocal" string.',
            "vocal is one line of at most 220 characters that can be spoken aloud.",
            `Request: ${text.slice(0, 800)}`,
          ].join(" "),
        },
      ],
    },
    note: "buy.ai settles this call on Celo in USDC, USD₮, or USA₮. A second signature renders the vocal line.",
  };
}

export function voiceRequestFromVocal(vocal: string): PaidRequest {
  return buildRequest("voice", vocal.slice(0, 280));
}
