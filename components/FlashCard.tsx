"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FlashCardItem } from "@/types";
import SpeakButton from "./SpeakButton";
import ProgressBar from "./ProgressBar";
import { speakAuto, speak, detectLang } from "@/lib/speech";

interface Props {
  items: FlashCardItem[];
  onComplete: (stars: number) => void;
}

export default function FlashCard({ items, onComplete }: Props) {
  const [index,   setIndex]   = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen,    setSeen]    = useState<Set<number>>(new Set([0]));

  const item  = items[index]!;
  const total = items.length;

  // ── Auto-speak main text when card changes ────
  useEffect(() => {
    const timer = setTimeout(() => {
      speakAuto(item.main);
    }, 400); // delay بسيط عشان الكارد يتلود الأول
    return () => clearTimeout(timer);
  }, [index, item.main]);

  // ── Auto-speak sub text when card is flipped ──
  useEffect(() => {
    if (!flipped) return;
    const timer = setTimeout(() => {
      speak(item.sub, detectLang(item.sub));
    }, 300);
    return () => clearTimeout(timer);
  }, [flipped, item.sub]);

  const go = (dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0 || next > total) return;
    setIndex(next);
    setFlipped(false);
    setSeen((prev) => new Set([...prev, next]));
  };

  const handleFlip = () => {
    setFlipped((f) => !f);
  };

  const isDone = index === total;

  if (isDone) {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <span className="text-8xl animate-spin-once">🏆</span>
        <h2 className="text-2xl font-black text-brand-purple">أحسنت! خلصت الدرس</h2>
        <p className="text-gray-500">شفت {seen.size - 1} من {total} بطاقة</p>
        <button
          onClick={() => onComplete(3)}
          className="mt-2 px-8 py-3 bg-brand-purple text-white rounded-3xl font-bold text-lg active:scale-95 transition-transform"
        >
          🎉 استلم نجومك
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 pb-6">
      <ProgressBar current={index} total={total} />

      {/* Card */}
      <button
        onClick={handleFlip}
        className="relative w-full max-w-sm rounded-4xl shadow-xl p-8 flex flex-col items-center gap-3
                   active:scale-95 transition-transform duration-200 cursor-pointer border-0"
        style={{ background: item.color }}
      >
        <span className="text-7xl select-none">{item.emoji}</span>
        <span className="text-4xl font-black text-gray-800">{item.main}</span>

        {flipped ? (
          <>
            <span className="text-xl text-gray-700 font-semibold">{item.sub}</span>
            {item.example && (
              <span className="text-sm text-gray-500 mt-1 italic text-center">
                «{item.example}»
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-gray-500 mt-1">📌 اضغط لتسمع المزيد</span>
        )}
      </button>

      {/* Speak buttons — اضغط عشان تسمع تاني */}
      <div className="flex gap-3 items-center">
        <SpeakButton
          text={item.main}
          lang={detectLang(item.main)}
          size="lg"
          label="🔊 استمع"
        />
        {flipped && item.sub && (
          <SpeakButton
            text={item.sub}
            lang={detectLang(item.sub)}
            size="lg"
            label="🔊 المعنى"
          />
        )}
      </div>

      {/* Counter */}
      <p className="text-sm text-gray-400">{index + 1} من {total}</p>

      {/* Navigation */}
      <div className="flex gap-3 mt-1">
        {index > 0 && (
          <button
            onClick={() => go(-1)}
            className="flex items-center gap-1 px-5 py-2.5 bg-gray-100 rounded-2xl font-bold text-gray-600 active:scale-95 transition-transform"
          >
            <ChevronRight size={18} /> السابق
          </button>
        )}
        <button
          onClick={() => go(1)}
          className="flex items-center gap-1 px-5 py-2.5 bg-brand-purple text-white rounded-2xl font-bold active:scale-95 transition-transform"
        >
          {index === total - 1 ? "🎉 انهيت!" : "التالي"}
          {index < total - 1 && <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
  );
}
