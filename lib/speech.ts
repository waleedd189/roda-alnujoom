"use client";

// ────────────────────────────────────────────────
//  محرك النطق — Roda Al-Nujoom
//
//  ترتيب المحاولات (أول واحد ينجح بيشتغل):
//   1) ملف صوت مُسجّل جاهز في /public/audio  (أعلى جودة)
//   2) /api/tts  → Google / Azure / ElevenLabs / OpenAI
//   3) Web Speech API  (صوت المتصفح — حل أخير)
//
//  + تصحيح نطق الحروف العربية قبل الإرسال لأي محرك.
//  ❗ القرآن مالوش علاقة بالملف ده — بيتشغّل بصوت قارئ
//    حقيقي من lib/quranAudio.ts
// ────────────────────────────────────────────────

import { playSources, stopAudio } from "./audioPlayer";
import { toSpeechText, hasArabic } from "./arabicText";
import { getSettings } from "./settings";

export type SpeechLang = "ar-EG" | "ar" | "en-US" | "en";

export interface SayOptions {
  lang?: SpeechLang;
  /** سرعة النطق — الافتراضي من الإعدادات */
  rate?: number;
  /** ملف صوت مسجّل جاهز (أعلى أولوية) */
  audio?: string;
  /** للحروف: ننطق اسم الحرف قبل صوته (افتراضي true) */
  letterNameFirst?: boolean;
  /** منخليش التصحيح التلقائي للنص */
  raw?: boolean;
}

export type SpeechEngine = "file" | "api" | "browser" | "none";

// ── هل /api/tts متاح؟ (بنسأل مرة واحدة ونكاش النتيجة) ──
let providerPromise: Promise<{ enabled: boolean; provider: string }> | null = null;

export function getTtsStatus(): Promise<{ enabled: boolean; provider: string }> {
  if (typeof window === "undefined") return Promise.resolve({ enabled: false, provider: "none" });
  if (!providerPromise) {
    providerPromise = fetch("/api/tts/status")
      .then((r) => (r.ok ? r.json() : { enabled: false, provider: "none" }))
      .catch(() => ({ enabled: false, provider: "none" }));
  }
  return providerPromise;
}

// ── اختيار اللغة تلقائيًا ────────────────────────
export function detectLang(text: string): SpeechLang {
  return hasArabic(text) ? "ar-EG" : "en-US";
}

export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && ("speechSynthesis" in window || true);
}

// ── Web Speech: اختيار أحسن صوت متاح ─────────────
const BAD_VOICE_HINTS = ["espeak", "compact", "eloquence"];
const GOOD_VOICE_HINTS = ["natural", "neural", "online", "google", "microsoft", "premium", "enhanced", "siri"];

function scoreVoice(v: SpeechSynthesisVoice, lang: string): number {
  const name = v.name.toLowerCase();
  const uri = (v.voiceURI || "").toLowerCase();
  let score = 0;

  if (v.lang.toLowerCase() === lang.toLowerCase()) score += 40;
  else if (v.lang.toLowerCase().startsWith(lang.split("-")[0]!.toLowerCase())) score += 25;
  else return -1000;

  // اللهجة المصرية أقرب للطفل المصري، والخليجية/الفصحى بعدها
  if (/ar[-_]eg/i.test(v.lang)) score += 12;
  if (/ar[-_](sa|xa)/i.test(v.lang)) score += 8;

  for (const hint of GOOD_VOICE_HINTS) if (name.includes(hint) || uri.includes(hint)) score += 10;
  for (const hint of BAD_VOICE_HINTS) if (name.includes(hint) || uri.includes(hint)) score -= 30;
  if (!v.localService) score += 6; // الأصوات السحابية عادة أحسن

  return score;
}

export function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -999;
  for (const v of voices) {
    const s = scoreVoice(v, lang);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return bestScore > -500 ? best : null;
}

/** قائمة الأصوات العربية المتاحة في المتصفح (للإعدادات/التشخيص) */
export function listArabicVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ar"));
}

export function hasArabicBrowserVoice(): boolean {
  return listArabicVoices().length > 0;
}

// ── Web Speech (حل أخير) ────────────────────────
function speakWithBrowser(text: string, lang: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return resolve();

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = Math.min(1.3, Math.max(0.55, rate));
    u.pitch = 1.05;
    u.volume = 1;

    const voice = pickVoice(lang);
    if (voice) u.voice = voice;

    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clearInterval(keepAlive);
      resolve();
    };

    u.onend = done;
    u.onerror = done;

    // Chrome بيوقف الكلام الطويل — نبضة كل 8 ثواني
    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) return done();
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 8000);

    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.speak(u);

    // أمان: لو المتصفح مرجّعش onend
    setTimeout(done, Math.max(4000, text.length * 160));
  });
}

// ── الدالة الرئيسية ─────────────────────────────
export async function say(text: string, options: SayOptions = {}): Promise<SpeechEngine> {
  if (typeof window === "undefined") return "none";

  const settings = getSettings();
  const lang = options.lang ?? detectLang(text);
  const rate = options.rate ?? settings.speechRate;
  const payload = options.raw
    ? text.trim()
    : toSpeechText(text, { letterNameFirst: options.letterNameFirst !== false });

  if (!payload) return "none";

  stopSpeech();

  // 1) ملف صوت مُسجّل
  if (options.audio) {
    try {
      await playSources([options.audio], { rate: 1 });
      return "file";
    } catch {
      /* نكمل للمحرك اللي بعده */
    }
  }

  // 2) محرك TTS احترافي عبر السيرفر
  try {
    const status = await getTtsStatus();
    if (status.enabled) {
      const url = `/api/tts?text=${encodeURIComponent(payload)}&lang=${encodeURIComponent(
        lang
      )}&rate=${rate.toFixed(2)}`;
      await playSources([url], { rate: 1 });
      return "api";
    }
  } catch {
    /* نكمل للمتصفح */
  }

  // 3) صوت المتصفح
  await speakWithBrowser(payload, lang.startsWith("ar") ? "ar-EG" : "en-US", rate);
  return "browser";
}

export function stopSpeech(): void {
  stopAudio();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ── توافق مع الكود القديم ───────────────────────
/** @deprecated استخدم say() */
export function speak(text: string, lang: SpeechLang = "ar-EG"): void {
  void say(text, { lang });
}

/** @deprecated استخدم say() */
export function speakAuto(text: string): void {
  void say(text);
}

/** تهيئة أصوات المتصفح مبكرًا (Chrome محتاج النداء ده) */
export function warmUpVoices(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
}
