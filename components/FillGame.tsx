"use client";
import { useState } from "react";
import type { FillItem } from "@/types";
import ProgressBar from "./ProgressBar";
import SpeakButton from "./SpeakButton";

interface Props {
  items: FillItem[];
  onComplete: (stars: number) => void;
}

export default function FillGame({ items, onComplete }: Props) {
  const [index,   setIndex]   = useState(0);
  const [picked,  setPicked]  = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);

  const item  = items[index]!;
  const total = items.length;

  const displaySentence = picked
    ? item.sentence.replace("___", `[${picked}]`)
    : item.sentence;

  const handlePick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === item.answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    const nextIdx = index + 1;
    if (nextIdx >= total) {
      const isLastCorrect = picked === item.answer ? 1 : 0;
      const pct   = (correct + isLastCorrect) / total;
      const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
      onComplete(stars);
    } else {
      setIndex(nextIdx);
      setPicked(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 pb-6">
      <ProgressBar current={index + 1} total={total} />

      <p className="text-lg font-bold text-gray-700">اختار الكلمة الصح ✏️</p>

      {/* Sentence */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-5 w-full text-center">
        <p className="text-2xl font-bold text-gray-800 leading-relaxed">{displaySentence}</p>
        {item.hint && !picked && (
          <p className="text-sm text-gray-400 mt-2">💡 تلميح: {item.hint}</p>
        )}
        <SpeakButton text={item.sentence.replace("___", item.answer)} className="mt-3" />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {item.options.map((opt) => {
          const isAnswer   = opt === item.answer;
          const isSelected = opt === picked;

          let cls = "py-4 px-3 rounded-2xl border-2 font-bold text-xl text-center transition-all duration-200 active:scale-95";
          if (picked && isAnswer)           cls += " bg-green-100 border-green-500 text-green-800";
          else if (isSelected && !isAnswer) cls += " bg-red-100 border-red-400 text-red-700";
          else                              cls += " bg-white border-gray-200 hover:border-brand-purple hover:bg-purple-50 cursor-pointer";

          return (
            <button key={opt} onClick={() => handlePick(opt)} disabled={!!picked} className={cls}>
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className={`w-full rounded-2xl p-4 text-center font-bold text-lg
          ${picked === item.answer ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {picked === item.answer ? "🎉 ممتاز!" : `❌ الصح: ${item.answer}`}
        </div>
      )}

      <p className="text-sm text-gray-400">سؤال {index + 1} من {total}</p>

      {picked && (
        <button onClick={next} className="px-8 py-3 bg-brand-purple text-white rounded-3xl font-bold text-lg active:scale-95 transition-transform">
          {index === total - 1 ? "🏆 شوف نتيجتك" : "التالي ←"}
        </button>
      )}
    </div>
  );
}
