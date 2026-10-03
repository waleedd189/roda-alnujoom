"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  Play,
  Repeat,
  SkipForward,
  BookOpenCheck,
} from "lucide-react";
import type { FlashCardItem } from "@/types";
import { ayahAudioSources, preloadAyah, RECITERS, SURAHS } from "@/lib/quranAudio";
import { playSources, stopAudio } from "@/lib/audioPlayer";
import { say, stopSpeech } from "@/lib/speech";
import useSettings from "@/hooks/useSettings";
import { sfxWin, unlockAudio } from "@/lib/sfx";
import ProgressBar from "./ProgressBar";

interface Props {
  items: FlashCardItem[];
  onComplete: (stars: number) => void;
}

type Mode = "read" | "memorize";

export default function QuranPlayer({ items, onComplete }: Props) {
  const { settings, update } = useSettings();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const [mode, setMode] = useState<Mode>("read");
  const [revealed, setRevealed] = useState(false);
  const [repeatLeft, setRepeatLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);

  const runId = useRef(0);
  const total = items.length;
  const item = items[index];
  const surahMeta = item?.surah ? SURAHS[item.surah] : undefined;

  const reciter = settings.reciter;
  const repeat = Math.max(1, settings.ayahRepeat);

  const sources = useMemo(
    () => (item?.surah && item?.ayah ? ayahAudioSources(item.surah, item.ayah, reciter) : []),
    [item?.surah, item?.ayah, reciter]
  );

  // تحميل مسبق للآية الجاية
  useEffect(() => {
    const next = items[index + 1];
    if (next?.surah && next?.ayah) preloadAyah(next.surah, next.ayah, reciter);
  }, [index, items, reciter]);

  useEffect(() => {
    setRevealed(false);
    setShowMeaning(false);
  }, [index, mode]);

  const stopAll = useCallback(() => {
    runId.current += 1;
    stopAudio();
    stopSpeech();
    setPlaying(false);
    setRepeatLeft(0);
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  /** تشغيل الآية الحالية (مع التكرار) ثم الانتقال لو التشغيل المتتابع شغال */
  const playAyah = useCallback(
    async (atIndex: number, times = repeat, chain = continuous) => {
      const target = items[atIndex];
      if (!target?.surah || !target?.ayah) return;

      unlockAudio();
      runId.current += 1;
      const myRun = runId.current;
      setError(null);
      setPlaying(true);

      const urls = ayahAudioSources(target.surah, target.ayah, reciter);

      for (let i = 0; i < times; i++) {
        if (myRun !== runId.current) return;
        setRepeatLeft(times - i);
        try {
          await playSources(urls);
        } catch {
          if (myRun !== runId.current) return;
          setError("مش قادر أحمّل التلاوة — اتأكد من الاتصال بالإنترنت");
          setPlaying(false);
          setRepeatLeft(0);
          return;
        }
        if (myRun !== runId.current) return;
        // سكتة صغيرة بين التكرارات عشان الطفل يردد
        if (i < times - 1) await new Promise((r) => setTimeout(r, 700));
      }

      if (myRun !== runId.current) return;
      setRepeatLeft(0);
      setPlaying(false);

      if (chain) {
        const next = atIndex + 1;
        if (next < total) {
          setIndex(next);
          setTimeout(() => {
            if (myRun === runId.current) void playAyah(next, times, true);
          }, 400);
        } else {
          setContinuous(false);
        }
      }
    },
    [items, reciter, repeat, continuous, total]
  );

  const handlePlayPause = () => {
    if (playing) {
      stopAll();
      setContinuous(false);
    } else {
      void playAyah(index, repeat, continuous);
    }
  };

  const handleContinuous = () => {
    if (continuous) {
      setContinuous(false);
      stopAll();
      return;
    }
    setContinuous(true);
    void playAyah(index, repeat, true);
  };

  const go = (dir: 1 | -1) => {
    stopAll();
    setContinuous(false);
    const next = index + dir;
    if (next < 0 || next >= total) return;
    setIndex(next);
  };

  const finish = () => {
    stopAll();
    sfxWin();
    onComplete(3);
  };

  if (!item) return null;

  const hasAudio = sources.length > 0;
  const hidden = mode === "memorize" && !revealed;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <ProgressBar current={index + 1} total={total} />

      {/* شريط المعلومات */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
          <BookOpenCheck size={15} />
          {surahMeta ? `سورة ${surahMeta.name}` : "تلاوة"} · آية {item.ayah ?? index + 1}
        </span>
        <button
          onClick={() => setMode(mode === "read" ? "memorize" : "read")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bold transition-colors ${
            mode === "memorize"
              ? "bg-amber-400 text-amber-950"
              : "bg-white text-gray-600 ring-1 ring-gray-200 dark:bg-white/10 dark:text-gray-200 dark:ring-white/15"
          }`}
        >
          {mode === "memorize" ? <EyeOff size={15} /> : <Eye size={15} />}
          {mode === "memorize" ? "وضع الحفظ" : "وضع القراءة"}
        </button>
      </div>

      {/* الآية */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-50 via-white to-amber-50 p-6 sm:p-8 shadow-xl ring-1 ring-violet-100 dark:from-violet-950/60 dark:via-slate-900 dark:to-slate-900 dark:ring-white/10">
        <div className="pointer-events-none absolute -left-6 -top-8 text-8xl opacity-10">﴿</div>
        <div className="pointer-events-none absolute -bottom-10 -right-4 text-8xl opacity-10">﴾</div>

        {hidden ? (
          <button
            onClick={() => setRevealed(true)}
            className="relative z-10 flex min-h-[8rem] w-full flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-300"
          >
            <span className="text-5xl">🙈</span>
            <span className="font-bold">النص مخفي — اسمع وردّد</span>
            <span className="text-sm text-gray-400">اضغط لإظهار الآية</span>
          </button>
        ) : (
          <p
            className="font-quran relative z-10 text-center text-2xl leading-[2.6] text-gray-900 sm:text-3xl sm:leading-[2.8] dark:text-amber-50"
            dir="rtl"
          >
            {item.main}
            <span className="mx-1 align-middle text-xl text-violet-400">﴿{item.ayah}﴾</span>
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-600 dark:bg-red-500/10">
          {error}
        </p>
      )}

      {/* أزرار التحكم */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-600 shadow ring-1 ring-gray-200 transition active:scale-95 disabled:opacity-40 dark:bg-white/10 dark:text-gray-200 dark:ring-white/10"
          aria-label="الآية السابقة"
        >
          <ChevronRight size={22} />
        </button>

        <button
          onClick={handlePlayPause}
          disabled={!hasAudio}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-300/60 transition active:scale-95 disabled:opacity-40 dark:shadow-violet-900/60"
          aria-label={playing ? "إيقاف" : "تشغيل التلاوة"}
        >
          {playing ? <Pause size={34} /> : <Play size={34} className="mr-1" />}
          {repeatLeft > 1 && (
            <span className="absolute -bottom-1 -left-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-amber-950">
              ×{repeatLeft}
            </span>
          )}
        </button>

        <button
          onClick={() => go(1)}
          disabled={index >= total - 1}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-600 shadow ring-1 ring-gray-200 transition active:scale-95 disabled:opacity-40 dark:bg-white/10 dark:text-gray-200 dark:ring-white/10"
          aria-label="الآية التالية"
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      {!hasAudio && (
        <p className="text-center text-xs text-gray-400">مفيش تلاوة مربوطة بالبطاقة دي</p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={handleContinuous}
          className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
            continuous
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50"
              : "bg-white text-gray-700 ring-1 ring-gray-200 dark:bg-white/10 dark:text-gray-100 dark:ring-white/10"
          }`}
        >
          <SkipForward size={16} />
          {continuous ? "إيقاف التشغيل المتتابع" : "تشغيل السورة كاملة"}
        </button>

        <button
          onClick={() => setShowMeaning((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 ring-1 ring-gray-200 transition active:scale-95 dark:bg-white/10 dark:text-gray-100 dark:ring-white/10"
        >
          💡 {showMeaning ? "إخفاء المعنى" : "اعرف المعنى"}
        </button>
      </div>

      {showMeaning && item.sub && (
        <div className="animate-bounce-in rounded-3xl bg-amber-50 p-4 text-center dark:bg-amber-500/10">
          <p className="text-base font-bold text-amber-900 dark:text-amber-100">{item.sub}</p>
          <button
            onClick={() => void say(item.sub)}
            className="mt-2 text-sm font-bold text-violet-600 underline dark:text-violet-300"
          >
            🔊 اسمع الشرح
          </button>
        </div>
      )}

      {/* عدد التكرارات + القارئ */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-white/5 dark:ring-white/10">
          <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-200">
            <Repeat size={15} /> تكرار الآية
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 5].map((n) => (
              <button
                key={n}
                onClick={() => update({ ayahRepeat: n })}
                className={`h-10 flex-1 rounded-xl text-sm font-black transition active:scale-95 ${
                  repeat === n
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-200"
                }`}
              >
                ×{n}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-white/5 dark:ring-white/10">
          <label className="mb-2 block text-sm font-bold text-gray-600 dark:text-gray-200">🎙️ القارئ</label>
          <select
            value={reciter}
            onChange={(e) => {
              stopAll();
              update({ reciter: e.target.value as typeof reciter });
            }}
            className="h-10 w-full rounded-xl bg-gray-100 px-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-violet-400 dark:bg-white/10 dark:text-gray-100"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.forKids ? " ⭐" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400">
        آية {index + 1} من {total}
      </p>

      {index >= total - 1 && (
        <button
          onClick={finish}
          className="mx-auto rounded-3xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-8 py-3.5 text-lg font-black text-white shadow-lg shadow-violet-200 transition active:scale-95 dark:shadow-violet-900/50"
        >
          🎉 خلصت — استلم نجومك
        </button>
      )}
    </div>
  );
}
