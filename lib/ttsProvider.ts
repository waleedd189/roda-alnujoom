// ────────────────────────────────────────────────
//  اكتشاف مزوّد النطق المتاح من متغيرات البيئة
//  (ملف سيرفر فقط — بيتقرأ من /api/tts)
// ────────────────────────────────────────────────

export type Provider = "google" | "azure" | "elevenlabs" | "openai" | "none";

export function detectProvider(): Provider {
  const explicit = (process.env.TTS_PROVIDER ?? "").trim().toLowerCase();
  if (explicit && explicit !== "auto") {
    return (["google", "azure", "elevenlabs", "openai", "none"] as const).includes(explicit as Provider)
      ? (explicit as Provider)
      : "none";
  }
  if (process.env.GOOGLE_TTS_API_KEY) return "google";
  if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) return "azure";
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "none";
}
