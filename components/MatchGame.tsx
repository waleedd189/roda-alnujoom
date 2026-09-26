"use client";
import { useState, useMemo } from "react";
import type { MatchPair } from "@/types";

interface Props {
  pairs: MatchPair[];
  onComplete: (stars: number) => void;
}

type Side = "left" | "right";
interface Selection { side: Side; value: string }

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MatchGame({ pairs, onComplete }: Props) {
  const lefts  = useMemo(() => shuffle(pairs.map((p) => p.left)),  [pairs]);
  const rights = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs]);

  const [selected, setSelected]  = useState<Selection | null>(null);
  const [matched,  setMatched]   = useState<Set<string>>(new Set());
  const [mistakes, setMistakes]  = useState(0);
  const [flash,    setFlash]     = useState<string | null>(null); // wrong flash value

  const handleClick = (side: Side, value: string) => {
    const key = side === "left" ? value : value; // value is unique per side
    if (matched.has(value)) return;

    if (!selected) {
      setSelected({ side, value });
      return;
    }

    if (selected.side === side) {
      // same side — swap selection
      setSelected({ side, value });
      return;
    }

    // try to match
    const leftVal  = side === "left" ? value : selected.value;
    const rightVal = side === "right" ? value : selected.value;
    const isMatch  = pairs.some((p) => p.left === leftVal && p.right === rightVal);

    if (isMatch) {
      const next = new Set([...matched, leftVal, rightVal]);
      setMatched(next);
      setSelected(null);
      if (next.size === pairs.length * 2) {
        const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        setTimeout(() => onComplete(stars), 500);
      }
    } else {
      setMistakes((m) => m + 1);
      setFlash(value);
      setTimeout(() => { setFlash(null); setSelected(null); }, 600);
    }
  };

  const itemClass = (side: Side, value: string) => {
    const isMatched  = matched.has(value);
    const isSelected = selected?.side === side && selected?.value === value;
    const isFlashing = flash === value;

    return `
      w-full py-4 px-3 rounded-2xl border-2 font-bold text-lg text-center
      transition-all duration-200 active:scale-95
      ${isMatched  ? "bg-green-100 border-green-500 text-green-800 pointer-events-none" : ""}
      ${isSelected ? "bg-purple-100 border-brand-purple text-brand-purple" : ""}
      ${isFlashing ? "bg-red-100 border-red-400 animate-shake" : ""}
      ${!isMatched && !isSelected && !isFlashing
          ? "bg-white border-gray-200 hover:border-brand-purple hover:bg-purple-50 cursor-pointer"
          : ""}
    `;
  };

  return (
    <div className="flex flex-col items-center gap-4 pb-6">
      <p className="text-lg font-bold text-gray-700">صِل الصورة بالإجابة الصحيحة 🔗</p>
      <p className="text-sm text-gray-400">تم مطابقة {matched.size / 2} من {pairs.length}</p>

      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Right column */}
        <div className="flex flex-col gap-3">
          {rights.map((r) => (
            <button key={r} onClick={() => handleClick("right", r)} className={itemClass("right", r)}>
              {r}
            </button>
          ))}
        </div>
        {/* Left column */}
        <div className="flex flex-col gap-3">
          {lefts.map((l) => (
            <button key={l} onClick={() => handleClick("left", l)} className={itemClass("left", l)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-2">أخطاء: {mistakes}</p>
    </div>
  );
}
