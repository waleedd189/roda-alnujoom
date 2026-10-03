"use client";

import { useMemo } from "react";

const EMOJIS = ["⭐", "🌟", "🎉", "✨", "🎊", "💫"];

/** مطر احتفالي خفيف — CSS فقط، من غير أي مكتبة */
export default function Confetti({ count = 26 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.6,
        duration: 2.6 + Math.random() * 2,
        size: 14 + Math.random() * 20,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]!,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-[-10%]"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
