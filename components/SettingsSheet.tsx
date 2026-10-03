"use client";

import { useEffect, useState } from "react";
import { Moon, Settings, Sun, X } from "lucide-react";
import useSettings from "@/hooks/useSettings";
import { ayahAudioUrl, RECITERS } from "@/lib/quranAudio";
import {
  diagnoseAudio,
  diagnoseQuranAudio,
  getTtsStatus,
  listArabicVoices,
  say,
  type EngineReport,
  type SpeechEngine,
} from "@/lib/speech";
import { sfxCorrect, unlockAudio } from "@/lib/sfx";

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google Cloud TTS",
  azure: "Azure Speech",
  elevenlabs: "ElevenLabs",
  openai: "OpenAI",
  none: "مش مفعّل",
};

const ENGINE_LABEL: Record<SpeechEngine, string> = {
  file: "ملف مسجّل",
  api: "محرك احترافي",
  free: "المحرك المجاني",
  browser: "صوت المتصفح",
  none: "مفيش صوت",
};

export default function SettingsSheet() {
  const { settings, update, toggleTheme } = useSettings();
  const [open, setOpen] = useState(false);
  const [tts, setTts] = useState<{ enabled: boolean; provider: string } | null>(null);
  const [arVoices, setArVoices] = useState(0);
  const [reports, setReports] = useState<EngineReport[] | null>(null);
  const [quranOk, setQuranOk] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastEngine, setLastEngine] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setChecking(true);
    setReports(null);
    setQuranOk(null);
    try {
      const [engines, quran] = await Promise.all([
        diagnoseAudio(),
        diagnoseQuranAudio(ayahAudioUrl(112, 1, settings.reciter)),
      ]);
      setReports(engines);
      setQuranOk(quran);
    } finally {
      setChecking(false);
    }
  };

  const testVoice = async () => {
    const used = await say("مَرحَبًا بِك في رَوضَةِ النُّجوم");
    setLastEngine(ENGINE_LABEL[used] ?? used);
  };

  useEffect(() => {
    if (!open) return;
    void getTtsStatus().then(setTts);
    const check = () => setArVoices(listArabicVoices().length);
    check();
    const t = setTimeout(check, 600);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => {
          unlockAudio();
          setOpen(true);
        }}
        aria-label="الإعدادات"
        className="fixed bottom-5 left-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-xl shadow-violet-400/40 transition active:scale-95 dark:bg-violet-500"
      >
        <Settings size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" dir="rtl">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative max-h-[88vh] w-full max-w-lg animate-bounce-in overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">⚙️ الإعدادات</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-600 transition active:scale-95 dark:bg-white/10 dark:text-gray-200"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* المظهر */}
            <section className="mb-4 rounded-3xl bg-gray-50 p-4 dark:bg-white/5">
              <h3 className="mb-3 font-black text-gray-800 dark:text-gray-100">🎨 المظهر</h3>
              <button
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 font-bold text-gray-700 shadow-sm transition active:scale-[0.98] dark:bg-white/10 dark:text-gray-100"
              >
                <span className="flex items-center gap-2">
                  {settings.theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                  {settings.theme === "dark" ? "الوضع الليلي" : "الوضع النهاري"}
                </span>
                <span className="text-sm text-violet-600 dark:text-violet-300">تبديل</span>
              </button>
            </section>

            {/* الصوت */}
            <section className="mb-4 rounded-3xl bg-gray-50 p-4 dark:bg-white/5">
              <h3 className="mb-3 font-black text-gray-800 dark:text-gray-100">🔊 الصوت والنطق</h3>

              <label className="mb-3 flex items-center justify-between gap-3 text-sm font-bold text-gray-700 dark:text-gray-200">
                نطق تلقائي عند فتح البطاقة
                <input
                  type="checkbox"
                  checked={settings.autoPlay}
                  onChange={(e) => update({ autoPlay: e.target.checked })}
                  className="h-5 w-5 accent-violet-600"
                />
              </label>

              <label className="mb-3 flex items-center justify-between gap-3 text-sm font-bold text-gray-700 dark:text-gray-200">
                مؤثرات صوتية (نجاح / خطأ)
                <input
                  type="checkbox"
                  checked={settings.sfx}
                  onChange={(e) => {
                    update({ sfx: e.target.checked });
                    if (e.target.checked) setTimeout(sfxCorrect, 60);
                  }}
                  className="h-5 w-5 accent-violet-600"
                />
              </label>

              <div className="mb-2">
                <div className="mb-1 flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-200">
                  <span>سرعة النطق</span>
                  <span className="text-violet-600 dark:text-violet-300">{settings.speechRate.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={1.2}
                  step={0.05}
                  value={settings.speechRate}
                  onChange={(e) => update({ speechRate: Number(e.target.value) })}
                  className="w-full accent-violet-600"
                />
              </div>

              <label className="mb-3 flex items-center justify-between gap-3 text-sm font-bold text-gray-700 dark:text-gray-200">
                <span>
                  المحرك المجاني
                  <span className="block text-xs font-normal text-gray-500">
                    نطق عربي أوضح بكتير من صوت المتصفح — من غير أي مفتاح
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.freeTts}
                  onChange={(e) => update({ freeTts: e.target.checked })}
                  className="h-5 w-5 flex-shrink-0 accent-violet-600"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => void testVoice()}
                  className="rounded-2xl bg-violet-600 py-2.5 text-sm font-bold text-white transition active:scale-95"
                >
                  🔊 جرّب الصوت
                </button>
                <button
                  onClick={() => void runDiagnostics()}
                  disabled={checking}
                  className="rounded-2xl bg-white py-2.5 text-sm font-bold text-violet-700 shadow-sm ring-1 ring-violet-200 transition active:scale-95 disabled:opacity-60 dark:bg-white/10 dark:text-violet-200 dark:ring-white/10"
                >
                  {checking ? "⏳ بيفحص..." : "🩺 افحص الصوت"}
                </button>
              </div>

              {lastEngine && (
                <p className="mt-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-300">
                  اتشغّل بـ: {lastEngine}
                </p>
              )}

              {reports && (
                <div className="mt-3 space-y-1.5">
                  {reports.map((r) => (
                    <div
                      key={r.engine}
                      className="flex items-start justify-between gap-2 rounded-2xl bg-white p-2.5 text-xs dark:bg-white/5"
                    >
                      <span className="font-bold text-gray-700 dark:text-gray-100">{r.label}</span>
                      <span className="flex-shrink-0 text-left">
                        <span className={r.ok ? "text-emerald-600" : "text-red-500"}>{r.ok ? "✅" : "❌"}</span>
                        <span className="block text-[11px] text-gray-500 dark:text-gray-400">{r.detail}</span>
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-white p-2.5 text-xs dark:bg-white/5">
                    <span className="font-bold text-gray-700 dark:text-gray-100">تلاوة القرآن (CDN)</span>
                    <span className={quranOk ? "text-emerald-600" : "text-red-500"}>
                      {quranOk === null ? "—" : quranOk ? "✅ شغّالة" : "❌ متحجوبة"}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-3 rounded-2xl bg-white p-3 text-xs leading-6 text-gray-500 dark:bg-white/5 dark:text-gray-300">
                مفتاح TTS احترافي:{" "}
                <strong className="text-violet-600 dark:text-violet-300">
                  {PROVIDER_LABEL[tts?.provider ?? "none"] ?? tts?.provider}
                </strong>
                {!tts?.enabled && (
                  <>
                    <br />
                    {settings.freeTts
                      ? "شغّال دلوقتي بالمحرك المجاني. لأعلى جودة ممكنة ضيف مفتاح في .env.local"
                      : arVoices > 0
                        ? `المتصفح عنده ${arVoices} صوت عربي فقط — شغّل المحرك المجاني فوق`
                        : "⚠️ مفيش صوت عربي في جهازك — شغّل المحرك المجاني فوق"}
                  </>
                )}
              </div>
            </section>

            {/* القرآن */}
            <section className="mb-2 rounded-3xl bg-gray-50 p-4 dark:bg-white/5">
              <h3 className="mb-3 font-black text-gray-800 dark:text-gray-100">📿 تلاوة القرآن</h3>
              <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-200">القارئ</label>
              <select
                value={settings.reciter}
                onChange={(e) => update({ reciter: e.target.value as typeof settings.reciter })}
                className="mb-2 h-11 w-full rounded-2xl bg-white px-3 text-sm font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-violet-400 dark:bg-white/10 dark:text-gray-100"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {r.forKids ? " ⭐ للأطفال" : ""}
                  </option>
                ))}
              </select>
              <p className="mb-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
                {RECITERS.find((r) => r.id === settings.reciter)?.note}
              </p>

              <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-200">
                تكرار الآية في وضع الحفظ
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => update({ ayahRepeat: n })}
                    className={`h-10 flex-1 rounded-xl text-sm font-black transition active:scale-95 ${
                      settings.ayahRepeat === n
                        ? "bg-violet-600 text-white"
                        : "bg-white text-gray-600 shadow-sm dark:bg-white/10 dark:text-gray-200"
                    }`}
                  >
                    ×{n}
                  </button>
                ))}
              </div>

              <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs leading-6 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                ✅ القرآن بيتشغّل دايمًا بصوت قارئ حقيقي — مش صوت آلي.
              </p>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
