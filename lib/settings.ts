"use client";

// ────────────────────────────────────────────────
//  إعدادات التطبيق — محفوظة في localStorage
//  الصوت / القارئ / السرعة / الوضع الليلي
// ────────────────────────────────────────────────

import { DEFAULT_RECITER, type ReciterId } from "./quranAudio";

export interface AppSettings {
  /** قارئ القرآن */
  reciter: ReciterId;
  /** سرعة النطق (0.6 - 1.2) */
  speechRate: number;
  /** تشغيل الصوت تلقائيًا عند فتح البطاقة */
  autoPlay: boolean;
  /** مؤثرات صوتية (نجاح/خطأ) */
  sfx: boolean;
  /** الوضع الليلي */
  theme: "light" | "dark";
  /** عدد مرات تكرار الآية في وضع الحفظ */
  ayahRepeat: number;
  /** استخدام محرك النطق المجاني (من غير مفتاح API) */
  freeTts: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  reciter: DEFAULT_RECITER,
  speechRate: 0.85,
  autoPlay: true,
  sfx: true,
  theme: "light",
  ayahRepeat: 2,
  freeTts: true,
};

const KEY = "roda_settings_v1";
const EVENT = "roda:settings";

let cache: AppSettings | null = null;

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) } : { ...DEFAULT_SETTINGS };
  } catch {
    cache = { ...DEFAULT_SETTINGS };
  }
  return cache;
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...patch };
  cache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
    window.dispatchEvent(new CustomEvent<AppSettings>(EVENT, { detail: next }));
    applyTheme(next.theme);
  }
  return next;
}

export function subscribeSettings(fn: (s: AppSettings) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (e: Event) => fn((e as CustomEvent<AppSettings>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

export { KEY as SETTINGS_KEY };
