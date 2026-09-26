"use client";
import { useState, useEffect, useRef } from "react";
import { speakAuto, isSpeechAvailable, speak, type SpeechLang } from "@/lib/speech";

export function useSpeech() {
  const [available, setAvailable] = useState(false);
  const [speaking,  setSpeaking]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const init = () => {
      // Chrome يحتاج getVoices() يتسمى مرة عشان يلود الأصوات
      window.speechSynthesis.getVoices();
      setAvailable(true);
    };

    init();

    // Chrome بيطلق onvoiceschanged بعد شوية
    window.speechSynthesis.onvoiceschanged = init;

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const say = (text: string, lang?: SpeechLang) => {
    if (!isSpeechAvailable()) return;

    // وقف أي كلام شغال
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    setSpeaking(true);

    if (lang) speak(text, lang);
    else speakAuto(text);

    // تقدير مدة الكلام (حرف ≈ 80ms)
    const duration = Math.max(1000, text.length * 80);
    timerRef.current = setTimeout(() => setSpeaking(false), duration);
  };

  const stop = () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);
    setSpeaking(false);
  };

  return { available, speaking, say, stop };
}
