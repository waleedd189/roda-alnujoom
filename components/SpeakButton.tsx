"use client";

import { Loader2, Volume2, VolumeX } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import type { SpeechLang } from "@/lib/speech";
import { unlockAudio } from "@/lib/sfx";

interface Props {
  text: string;
  lang?: SpeechLang;
  /** ملف صوت مسجّل (أولوية أعلى من المحركات) */
  audio?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const iconSize: Record<"sm" | "md" | "lg", number> = { sm: 14, md: 16, lg: 20 };

export default function SpeakButton({ text, lang, audio, size = "md", label, className = "" }: Props) {
  const { available, speaking, say, stop } = useSpeech();

  if (!available) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    if (speaking) stop();
    else void say(text, { lang, audio });
  };

  const icon = speaking ? <VolumeX size={iconSize[size]} /> : <Volume2 size={iconSize[size]} />;

  if (label) {
    return (
      <button
        onClick={handleClick}
        title={speaking ? "إيقاف" : "استمع"}
        className={`
          inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold shadow-sm
          transition-all duration-200 active:scale-95
          ${
            speaking
              ? "animate-pulse bg-violet-600 text-white shadow-violet-300"
              : "border border-violet-200 bg-white text-violet-700 hover:bg-violet-600 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-violet-200"
          }
          ${className}
        `}
      >
        {speaking ? <Loader2 size={iconSize[size]} className="animate-spin" /> : icon}
        <span>{speaking ? "إيقاف" : label}</span>
      </button>
    );
  }

  const sizeClass = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12" }[size];

  return (
    <button
      onClick={handleClick}
      title={speaking ? "إيقاف" : "استمع"}
      className={`
        inline-flex items-center justify-center rounded-full
        transition-all duration-200 active:scale-95
        ${
          speaking
            ? "animate-pulse bg-violet-600 text-white shadow-lg shadow-violet-300"
            : "border border-violet-100 bg-white text-violet-700 shadow hover:bg-violet-600 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-violet-200"
        }
        ${sizeClass} ${className}
      `}
    >
      {icon}
    </button>
  );
}
