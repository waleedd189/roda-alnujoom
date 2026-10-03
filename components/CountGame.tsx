"use client";
import { useState, useMemo } from "react";
import type { CountItem } from "@/types";
import ProgressBar from "./ProgressBar";
import { sfxCorrect, sfxWrong, sfxWin, unlockAudio } from "@/lib/sfx";
import { say } from "@/lib/speech";

interface Props {
  items: CountItem[];
  onComplete: (stars: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function CountGame({ items, onComplete }: Props) {
  const [index,   setIndex]   = useState(0);
  const [picked,  setPicked]  = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const item    = items[index]!;
  const total   = items.length;
  const options = useMemo(() => shuffle(item.options), [item]);

  const handlePick = (val: number) => {
    if (picked !== null) return;
    unlockAudio();
    setPicked(val);
    if (val === item.count) {
      setCorrect((c) => c + 1);
      sfxCorrect();
    } else {
      sfxWrong();
    }
    setTimeout(() => void say(`العدد ${item.count}`), 600);
  };

  const next = () => {
    const nextIdx = index + 1;
    if (nextIdx >= total) {
      const isLastCorrect = picked === item.count ? 1 : 0;
      const finalCorrect  = correct + isLastCorrect;
      const pct   = finalCorrect / total;
      const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
      sfxWin();
      onComplete(stars);
    } else {
      setIndex(nextIdx);
      setPicked(null);
    }
  };

  // Build emoji display string
  const emojiRow = Array.from({ length: item.count }).fill(item.emoji).join(" ");

  return (
    <div className="flex flex-col items-center gap-5 pb-6">
      <ProgressBar current={index + 1} total={total} />

      <p className="text-xl font-bold text-gray-800">احسب الصور كام؟</p>

      {/* Emoji display */}
      <div className="flex flex-wrap gap-2 justify-center bg-gray-50 rounded-3xl p-5 w-full text-4xl min-h-20 leading-relaxed">
        {emojiRow}
      </div>

      {/* Options */}
      <div className="flex gap-3 flex-wrap justify-center">
        {options.map((opt) => {
          const isCorrect  = opt === item.count;
          const isSelected = opt === picked;

          let cls = "w-16 h-16 rounded-2xl border-2 font-black text-2xl transition-all duration-200 active:scale-95";
          if (picked !== null && isCorrect)  cls += " bg-green-100 border-green-500 text-green-800";
          else if (isSelected && !isCorrect) cls += " bg-red-100 border-red-400 text-red-700";
          else cls += " bg-white border-gray-200 hover:border-brand-purple hover:bg-purple-50 cursor-pointer";

          return (
            <button key={opt} onClick={() => handlePick(opt)} disabled={picked !== null} className={cls}>
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className={`w-full rounded-2xl p-4 text-center font-bold text-lg
          ${picked === item.count ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {picked === item.count
            ? `🎉 صح! في ${item.count} ${item.emoji}`
            : `❌ الإجابة كانت ${item.count}`}
        </div>
      )}

      <p className="text-sm text-gray-400">سؤال {index + 1} من {total}</p>

      {picked !== null && (
        <button onClick={next} className="px-8 py-3 bg-brand-purple text-white rounded-3xl font-bold text-lg active:scale-95 transition-transform">
          {index === total - 1 ? "🏆 شوف نتيجتك" : "التالي ←"}
        </button>
      )}
    </div>
  );
}
