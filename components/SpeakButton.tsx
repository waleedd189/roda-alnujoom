"use client";
import { Volume2, VolumeX } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import type { SpeechLang } from "@/lib/speech";

interface Props {
  text: string;
  lang?: SpeechLang;
  size?: "sm" | "md" | "lg";
  label?: string;       // نص جنب الأيقونة
  className?: string;
}

const iconSize: Record<"sm" | "md" | "lg", number> = { sm: 14, md: 16, lg: 20 };

export default function SpeakButton({ text, lang, size = "md", label, className = "" }: Props) {
  const { available, speaking, say, stop } = useSpeech();

  if (!available) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // لا يفلِّب الكارد لو كان جواه
    if (speaking) stop();
    else say(text, lang);
  };

  if (label) {
    // زرار بنص — أوضح للأطفال
    return (
      <button
        onClick={handleClick}
        title={speaking ? "إيقاف" : "استمع"}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm
          transition-all duration-200 active:scale-95 shadow-sm
          ${speaking
            ? "bg-violet-600 text-white shadow-violet-300 animate-pulse"
            : "bg-white text-violet-700 hover:bg-violet-600 hover:text-white border border-violet-200"
          }
          ${className}
        `}
      >
        {speaking ? <VolumeX size={iconSize[size]} /> : <Volume2 size={iconSize[size]} />}
        <span>{speaking ? "إيقاف" : label}</span>
      </button>
    );
  }

  // زرار دائري بدون نص
  const sizeClass = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12" }[size];

  return (
    <button
      onClick={handleClick}
      title={speaking ? "إيقاف" : "استمع"}
      className={`
        inline-flex items-center justify-center rounded-full
        transition-all duration-200 active:scale-95
        ${speaking
          ? "bg-violet-600 text-white shadow-lg shadow-violet-300 animate-pulse"
          : "bg-white text-violet-700 hover:bg-violet-600 hover:text-white shadow border border-violet-100"
        }
        ${sizeClass} ${className}
      `}
    >
      {speaking ? <VolumeX size={iconSize[size]} /> : <Volume2 size={iconSize[size]} />}
    </button>
  );
}
