// ────────────────────────────────────────────────
//  /api/tts — نطق احترافي للنصوص العربية والإنجليزية
//
//  بيشتغل مع أي مزوّد من دول (حسب المفتاح الموجود في .env.local):
//    • Google Cloud TTS   → GOOGLE_TTS_API_KEY
//    • Azure Speech       → AZURE_SPEECH_KEY + AZURE_SPEECH_REGION
//    • ElevenLabs         → ELEVENLABS_API_KEY
//    • OpenAI             → OPENAI_API_KEY
//
//  لو مفيش أي مفتاح → بيرجّع 503 والتطبيق بيرجع تلقائيًا
//  لصوت المتصفح (Web Speech) كحل أخير.
// ────────────────────────────────────────────────

import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { detectProvider, type Provider } from "@/lib/ttsProvider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── كاش في الذاكرة عشان منستهلكش الـ API كل مرة ──
const MAX_CACHE_ITEMS = 400;
const cache = new Map<string, Buffer>();

function cacheGet(key: string): Buffer | undefined {
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit); // LRU: رجّعها لآخر الطابور
  }
  return hit;
}

function cacheSet(key: string, value: Buffer) {
  cache.set(key, value);
  while (cache.size > MAX_CACHE_ITEMS) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

const clampRate = (v: number) => Math.min(1.4, Math.max(0.5, Number.isFinite(v) ? v : 1));

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Google Cloud Text-to-Speech ─────────────────
async function synthGoogle(text: string, lang: string, rate: number): Promise<Buffer> {
  const key = process.env.GOOGLE_TTS_API_KEY!;
  const isAr = lang.startsWith("ar");
  const languageCode = isAr ? "ar-XA" : "en-US";
  const name = isAr
    ? process.env.GOOGLE_TTS_VOICE_AR || "ar-XA-Wavenet-D"
    : process.env.GOOGLE_TTS_VOICE_EN || "en-US-Neural2-F";

  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode, name },
      audioConfig: { audioEncoding: "MP3", speakingRate: rate, pitch: isAr ? 0 : 1 },
    }),
  });

  if (!res.ok) throw new Error(`google-tts ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { audioContent?: string };
  if (!json.audioContent) throw new Error("google-tts: empty response");
  return Buffer.from(json.audioContent, "base64");
}

// ── Azure Cognitive Services Speech ─────────────
async function synthAzure(text: string, lang: string, rate: number): Promise<Buffer> {
  const key = process.env.AZURE_SPEECH_KEY!;
  const region = process.env.AZURE_SPEECH_REGION!;
  const isAr = lang.startsWith("ar");
  const voice = isAr
    ? process.env.AZURE_VOICE_AR || "ar-EG-SalmaNeural"
    : process.env.AZURE_VOICE_EN || "en-US-JennyNeural";
  const localeCode = isAr ? "ar-EG" : "en-US";
  const pct = Math.round((rate - 1) * 100);

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${localeCode}">
  <voice name="${voice}">
    <prosody rate="${pct >= 0 ? "+" : ""}${pct}%">${escapeXml(text)}</prosody>
  </voice>
</speak>`;

  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "roda-alnujoom",
    },
    body: ssml,
  });

  if (!res.ok) throw new Error(`azure-tts ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── ElevenLabs ──────────────────────────────────
async function synthElevenLabs(text: string, lang: string): Promise<Buffer> {
  const key = process.env.ELEVENLABS_API_KEY!;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const model = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: model,
        language_code: lang.startsWith("ar") ? "ar" : "en",
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true },
      }),
    }
  );

  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── OpenAI ──────────────────────────────────────
async function synthOpenAI(text: string, rate: number): Promise<Buffer> {
  const key = process.env.OPENAI_API_KEY!;
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: process.env.OPENAI_TTS_VOICE || "alloy",
      input: text,
      response_format: "mp3",
      speed: rate,
    }),
  });

  if (!res.ok) throw new Error(`openai-tts ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function synthesize(provider: Provider, text: string, lang: string, rate: number): Promise<Buffer> {
  switch (provider) {
    case "google":
      return synthGoogle(text, lang, rate);
    case "azure":
      return synthAzure(text, lang, rate);
    case "elevenlabs":
      return synthElevenLabs(text, lang);
    case "openai":
      return synthOpenAI(text, rate);
    default:
      throw new Error("no-provider");
  }
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const text = (params.get("text") ?? "").slice(0, 600).trim();
  const lang = params.get("lang") ?? "ar";
  const rate = clampRate(Number(params.get("rate") ?? "1"));

  if (!text) {
    return Response.json({ error: "missing text" }, { status: 400 });
  }

  const provider = detectProvider();
  if (provider === "none") {
    return Response.json(
      { error: "tts-not-configured", hint: "ضيف مفتاح TTS في .env.local — راجع .env.local.example" },
      { status: 503 }
    );
  }

  const key = createHash("sha1").update(`${provider}|${lang}|${rate}|${text}`).digest("hex");
  const cached = cacheGet(key);
  if (cached) {
    return new Response(new Uint8Array(cached), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Provider": provider,
        "X-TTS-Cache": "hit",
      },
    });
  }

  try {
    const audio = await synthesize(provider, text, lang, rate);
    cacheSet(key, audio);
    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Provider": provider,
        "X-TTS-Cache": "miss",
      },
    });
  } catch (err) {
    console.error("[tts]", err);
    return Response.json({ error: "tts-failed", provider }, { status: 502 });
  }
}
