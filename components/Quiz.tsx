"use client";
import { useState, useEffect } from "react";
import type { QuizItem } from "@/types";
import SpeakButton from "./SpeakButton";
import ProgressBar from "./ProgressBar";
import { say, detectLang, stopSpeech } from "@/lib/speech";
import { getSettings } from "@/lib/settings";
import { sfxCorrect, sfxWrong, sfxWin, unlockAudio } from "@/lib/sfx";

interface Props {
  items: QuizItem[];
  onComplete: (stars: number) => void;
}

export default function Quiz({ items, onComplete }: Props) {
  const [index,    setIndex]    = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct,  setCorrect]  = useState(0);

  const item     = items[index]!;
  const total    = items.length;
  const answered = selected !== null;

  // ── Auto-speak question when it changes ───────
  useEffect(() => {
    if (!getSettings().autoPlay) return;
    const timer = setTimeout(() => {
      void say(item.speech ?? item.question, { audio: item.audio });
    }, 400);
    return () => clearTimeout(timer);
  }, [index, item.question, item.speech, item.audio]);

  useEffect(() => () => stopSpeech(), []);

  const handleAnswer = (i: number) => {
    if (answered) return;
    unlockAudio();
    setSelected(i);

    if (i === item.correctIndex) {
      setCorrect((c) => c + 1);
      sfxCorrect();
    } else {
      sfxWrong();
    }

    // ننطق الإجابة الصحيحة عشان الطفل يسمعها صح
    const answerText = item.options[item.correctIndex];
    if (answerText) {
      setTimeout(() => void say(answerText, { lang: detectLang(answerText) }), 650);
    }
  };

  const next = () => {
    const nextIdx = index + 1;
    stopSpeech();
    if (nextIdx >= total) {
      const pct = correct / total;
      const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
      sfxWin();
      onComplete(stars);
    } else {
      setIndex(nextIdx);
      setSelected(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 pb-6">
      <ProgressBar current={index + 1} total={total} />

      {/* Question */}
      <div className="text-6xl">{item.icon}</div>
      <div className="flex items-center gap-2">
        <p className="text-xl font-bold text-center text-gray-800">{item.question}</p>
        <SpeakButton text={item.question} lang={detectLang(item.question)} />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {item.options.map((opt, i) => {
          const isCorrect = i === item.correctIndex;
          const isSelected = i === selected;

          let bg = "bg-white border-gray-200";
          if (answered && isCorrect) bg = "bg-green-100 border-green-500";
          else if (answered && isSelected && !isCorrect) bg = "bg-red-100 border-red-500";

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`
                py-5 px-3 rounded-3xl border-2 font-bold text-lg text-center
                transition-all duration-200 active:scale-95
                ${bg}
                ${!answered ? "hover:border-brand-purple hover:bg-purple-50" : ""}
                ${answered ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div
          className={`w-full rounded-2xl p-4 text-center font-bold text-lg
            ${selected === item.correctIndex
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {selected === item.correctIndex ? "🎉 ممتاز! إجابة صح" : `❌ الصح: ${item.options[item.correctIndex]}`}
          {item.explanation && (
            <p className="text-sm font-normal mt-1 text-gray-600">{item.explanation}</p>
          )}
        </div>
      )}

      {/* Counter + Next */}
      <p className="text-sm text-gray-400">سؤال {index + 1} من {total}</p>
      {answered && (
        <button
          onClick={next}
          className="px-8 py-3 bg-brand-purple text-white rounded-3xl font-bold text-lg active:scale-95 transition-transform"
        >
          {index === total - 1 ? "🏆 شوف نتيجتك" : "السؤال الجاي ←"}
        </button>
      )}
    </div>
  );
}
