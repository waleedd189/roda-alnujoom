"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import type { FlashCardItem } from "@/types";
import SpeakButton from "./SpeakButton";
import ProgressBar from "./ProgressBar";
import { detectLang, say, stopSpeech } from "@/lib/speech";
import { isSingleLetter, letterName } from "@/lib/arabicText";
import { getSettings } from "@/lib/settings";
import { sfxTap, sfxWin, unlockAudio } from "@/lib/sfx";

interface Props {
  items: FlashCardItem[];
  onComplete: (stars: number) => void;
}

export default function FlashCard({ items, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const autoPlayed = useRef<number | null>(null);

  const total = items.length;
  const item = items[index];
  const isDone = index >= total;

  const speakMain = useCallback(
    (target: FlashCardItem) => {
      unlockAudio();
      void say(target.speech ?? target.main, {
        lang: detectLang(target.main),
        audio: target.audio,
      });
    },
    []
  );

  // ── نطق تلقائي عند فتح البطاقة ────────────────
  useEffect(() => {
    if (!item || isDone) return;
    if (!getSettings().autoPlay) return;
    if (autoPlayed.current === index) return;

    const timer = setTimeout(() => {
      autoPlayed.current = index;
      speakMain(item);
    }, 350);
    return () => clearTimeout(timer);
  }, [index, item, isDone, speakMain]);

  useEffect(() => () => stopSpeech(), []);

  const go = (dir: 1 | -1) => {
    stopSpeech();
    const next = index + dir;
    if (next < 0 || next > total) return;
    setIndex(next);
    setFlipped(false);
    if (next < total) setSeen((prev) => new Set([...Array.from(prev), next]));
  };

  const handleFlip = () => {
    sfxTap();
    const next = !flipped;
    setFlipped(next);
    if (next && item && getSettings().autoPlay) {
      setTimeout(() => void say(item.sub, { lang: detectLang(item.sub) }), 250);
    }
  };

  if (isDone || !item) {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <span className="animate-spin-once text-8xl">🏆</span>
        <h2 className="text-2xl font-black text-brand-purple dark:text-violet-300">أحسنت! خلصت الدرس</h2>
        <p className="text-gray-500 dark:text-gray-400">
          شفت {seen.size} من {total} بطاقة
        </p>
        <button
          onClick={() => {
            sfxWin();
            onComplete(3);
          }}
          className="mt-2 rounded-3xl bg-brand-purple px-8 py-3 text-lg font-bold text-white transition-transform active:scale-95"
        >
          🎉 استلم نجومك
        </button>
      </div>
    );
  }

  const letter = isSingleLetter(item.main);

  return (
    <div className="flex flex-col items-center gap-4 pb-6">
      <ProgressBar current={Math.min(index + 1, total)} total={total} />

      {/* Card */}
      <button
        onClick={handleFlip}
        className="flash-card-surface relative w-full max-w-sm cursor-pointer rounded-4xl border-0 p-8 shadow-xl transition-transform duration-200 active:scale-95"
        style={{ background: item.color }}
      >
        <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-black text-gray-600">
          <RotateCw size={11} /> اقلب
        </span>

        <div className="flex flex-col items-center gap-3">
          <span className="select-none text-7xl">{item.emoji}</span>
          <span className="text-5xl font-black text-gray-900">{item.main}</span>
          {letter && (
            <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-black text-gray-700">
              يُنطق: {letterName(item.main)}
            </span>
          )}

          {flipped ? (
            <>
              <span className="text-xl font-semibold text-gray-800">{item.sub}</span>
              {item.example && (
                <span className="mt-1 text-center text-sm italic text-gray-600">«{item.example}»</span>
              )}
            </>
          ) : (
            <span className="mt-1 text-sm text-gray-600">📌 اضغط لتسمع المزيد</span>
          )}
        </div>
      </button>

      {/* Speak buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SpeakButton
          text={item.speech ?? item.main}
          lang={detectLang(item.main)}
          audio={item.audio}
          size="lg"
          label="🔊 استمع"
        />
        {flipped && item.sub && (
          <SpeakButton text={item.sub} lang={detectLang(item.sub)} size="lg" label="🔊 المعنى" />
        )}
        {flipped && item.example && (
          <SpeakButton text={item.example} lang={detectLang(item.example)} size="lg" label="🔊 الجملة" />
        )}
      </div>

      <p className="text-sm text-gray-400">
        {index + 1} من {total}
      </p>

      {/* Navigation */}
      <div className="mt-1 flex gap-3">
        {index > 0 && (
          <button
            onClick={() => go(-1)}
            className="flex items-center gap-1 rounded-2xl bg-gray-100 px-5 py-2.5 font-bold text-gray-600 transition-transform active:scale-95 dark:bg-white/10 dark:text-gray-200"
          >
            <ChevronRight size={18} /> السابق
          </button>
        )}
        <button
          onClick={() => go(1)}
          className="flex items-center gap-1 rounded-2xl bg-brand-purple px-5 py-2.5 font-bold text-white transition-transform active:scale-95"
        >
          {index === total - 1 ? "🎉 انهيت!" : "التالي"}
          {index < total - 1 && <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
  );
}
