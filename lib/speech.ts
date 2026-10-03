"use client";

// ────────────────────────────────────────────────
//  محرك النطق — Roda Al-Nujoom
//
//  ترتيب المحاولات (أول واحد ينجح بيشتغل):
//   1) ملف صوت مُسجّل جاهز في /public/audio      (أعلى جودة)
//   2) /api/tts  → Google / Azure / ElevenLabs / OpenAI  (محتاج مفتاح)
//   3) المحرك المجاني (Google Translate TTS)      (من غير أي مفتاح)
//   4) Web Speech API  (صوت المتصفح — حل أخير)
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
  /** إجبار محرك معيّن (للفحص والتشخيص) */
  engine?: SpeechEngine;
}

export type SpeechEngine = "file" | "api" | "free" | "browser" | "none";

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
  return typeof window !== "undefined";
}

// ────────────────────────────────────────────────
//  المحرك المجاني — Google Translate TTS
//  الطلب بيخرج من متصفح الطفل مباشرة (مش من السيرفر)
//  فمش محتاج أي مفتاح ولا إعداد.
//  الحد الأقصى ~200 حرف للطلب، فبنقسّم النص.
// ────────────────────────────────────────────────
const FREE_TTS_ENDPOINTS = [
  { host: "https://translate.googleapis.com", client: "gtx" },
  { host: "https://translate.google.com", client: "tw-ob" },
  { host: "https://translate.googleapis.com", client: "tw-ob" },
];
const FREE_TTS_LIMIT = 180;

export function splitForTts(text: string, limit = FREE_TTS_LIMIT): string[] {
  const clean = text.trim();
  if (clean.length <= limit) return [clean];

  const chunks: string[] = [];
  let current = "";

  for (const word of clean.split(/\s+/)) {
    if ((current + " " + word).trim().length > limit) {
      if (current) chunks.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

function freeTtsUrls(chunk: string, lang: string, rate: number, index: number, total: number): string[] {
  const tl = lang.startsWith("ar") ? "ar" : "en";
  const speed = Math.min(1, Math.max(0.24, rate));
  return FREE_TTS_ENDPOINTS.map(
    ({ host, client }) =>
      `${host}/translate_tts?ie=UTF-8&client=${client}&tl=${tl}&ttsspeed=${speed.toFixed(2)}` +
      `&total=${total}&idx=${index}&textlen=${chunk.length}&q=${encodeURIComponent(chunk)}`
  );
}

async function speakWithFreeTts(text: string, lang: string, rate: number): Promise<void> {
  const chunks = splitForTts(text);
  for (let i = 0; i < chunks.length; i++) {
    await playSources(freeTtsUrls(chunks[i]!, lang, rate, i, chunks.length));
  }
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
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return reject(new Error("no-speech-api"));

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = Math.min(1.3, Math.max(0.55, rate));
    u.pitch = 1.05;
    u.volume = 1;

    const voice = pickVoice(lang);
    if (voice) u.voice = voice;

    let settled = false;
    let spoke = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearInterval(keepAlive);
      if (ok) resolve();
      else reject(new Error("speech-failed"));
    };

    u.onstart = () => {
      spoke = true;
    };
    u.onend = () => finish(true);
    u.onerror = () => finish(false);

    // Chrome بيوقف الكلام الطويل — نبضة كل 8 ثواني
    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) return finish(spoke);
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 8000);

    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.speak(u);

    // أمان: لو المتصفح مرجّعش onend
    setTimeout(() => finish(spoke), Math.max(4000, text.length * 160));
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
  const only = options.engine;

  // 1) ملف صوت مُسجّل
  if (options.audio && (!only || only === "file")) {
    try {
      await playSources([options.audio], { rate: 1 });
      return "file";
    } catch {
      if (only) throw new Error("file-failed");
    }
  }

  // 2) محرك TTS احترافي عبر السيرفر (محتاج مفتاح)
  if (!only || only === "api") {
    try {
      const status = await getTtsStatus();
      if (status.enabled) {
        const url = `/api/tts?text=${encodeURIComponent(payload)}&lang=${encodeURIComponent(
          lang
        )}&rate=${rate.toFixed(2)}`;
        await playSources([url], { rate: 1 });
        return "api";
      }
      if (only) throw new Error("api-not-configured");
    } catch (err) {
      if (only) throw err;
    }
  }

  // 3) المحرك المجاني — من غير أي مفتاح
  if ((!only && settings.freeTts) || only === "free") {
    try {
      await speakWithFreeTts(payload, lang, rate);
      return "free";
    } catch (err) {
      if (only) throw err;
    }
  }

  // 4) صوت المتصفح
  if (!only || only === "browser") {
    try {
      await speakWithBrowser(payload, lang.startsWith("ar") ? "ar-EG" : "en-US", rate);
      return "browser";
    } catch (err) {
      if (only) throw err;
    }
  }

  return "none";
}

export function stopSpeech(): void {
  stopAudio();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ────────────────────────────────────────────────
//  تشخيص الصوت — بيقول بالظبط كل محرك شغال ولا لأ
// ────────────────────────────────────────────────
export interface EngineReport {
  engine: SpeechEngine;
  label: string;
  ok: boolean;
  detail: string;
}

/** بيختبر لو رابط صوت بيتحمّل فعلاً في المتصفح (من غير ما يشغّله) */
function canLoadAudio(url: string, timeout = 7000): Promise<boolean> {
  return new Promise((resolve) => {
    const a = new Audio();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      a.removeAttribute("src");
      resolve(ok);
    };
    a.preload = "auto";
    a.muted = true;
    a.oncanplaythrough = () => finish(true);
    a.onloadeddata = () => finish(true);
    a.onerror = () => finish(false);
    a.src = url;
    a.load();
    setTimeout(() => finish(false), timeout);
  });
}

export async function diagnoseAudio(): Promise<EngineReport[]> {
  const reports: EngineReport[] = [];

  // 1) المحرك الاحترافي
  const status = await getTtsStatus();
  reports.push({
    engine: "api",
    label: "محرك احترافي (مفتاح API)",
    ok: status.enabled,
    detail: status.enabled ? `مفعّل — ${status.provider}` : "مفيش مفتاح في .env.local",
  });

  // 2) المحرك المجاني
  const freeUrl = freeTtsUrls("بَاء", "ar", 0.9, 0, 1)[0]!;
  const freeOk = await canLoadAudio(freeUrl);
  reports.push({
    engine: "free",
    label: "المحرك المجاني (Google Translate)",
    ok: freeOk,
    detail: freeOk ? "شغّال — مش محتاج أي إعداد" : "متحجوب على الشبكة دي",
  });

  // 3) صوت المتصفح
  const voices = listArabicVoices();
  reports.push({
    engine: "browser",
    label: "صوت المتصفح (Web Speech)",
    ok: voices.length > 0,
    detail:
      voices.length > 0
        ? `${voices.length} صوت عربي — ${voices[0]!.name}`
        : "مفيش أي صوت عربي مثبّت في الجهاز",
  });

  return reports;
}

/** اختبار تلاوة القرآن (CDN) */
export async function diagnoseQuranAudio(url: string): Promise<boolean> {
  return canLoadAudio(url, 9000);
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
