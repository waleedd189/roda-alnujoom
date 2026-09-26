// ────────────────────────────────────────────────
//  Speech Utility — Web Speech API
//  Supports Arabic & English TTS
// ────────────────────────────────────────────────

export type SpeechLang = "ar-EG" | "en-US";

/**
 * Speak a text using the browser's built-in TTS.
 * Falls back silently if the browser doesn't support it.
 * Handles Chrome's bug where speech stops after ~15s.
 */
export function speak(text: string, lang: SpeechLang = "ar-EG"): void {
  if (typeof window === "undefined") return;
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang   = lang;
  utterance.rate   = 0.8;   // أبطأ شوية للأطفال
  utterance.pitch  = 1.1;
  utterance.volume = 1;

  // Try to find the best matching voice
  const voices = window.speechSynthesis.getVoices();
  const langCode = lang.split("-")[0]!;

  // نجرب نلاقي صوت بنفس اللغة والمنطقة أولاً ثم فقط اللغة
  const match =
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(langCode));

  if (match) utterance.voice = match;

  // Chrome bug fix: resume if paused
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  window.speechSynthesis.speak(utterance);

  // Chrome workaround: keep-alive ping every 10s for long texts
  if (text.length > 100) {
    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10_000);

    utterance.onend = () => clearInterval(keepAlive);
    utterance.onerror = () => clearInterval(keepAlive);
  }
}

/**
 * Detect the language from the text (Arabic vs Latin)
 */
export function detectLang(text: string): SpeechLang {
  return /[\u0600-\u06FF]/.test(text) ? "ar-EG" : "en-US";
}

/**
 * Speak with auto language detection
 */
export function speakAuto(text: string): void {
  speak(text, detectLang(text));
}

/**
 * Check if TTS is available in this browser
 */
export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
