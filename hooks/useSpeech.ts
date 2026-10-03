"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { say, stopSpeech, warmUpVoices, getTtsStatus, type SayOptions, type SpeechEngine } from "@/lib/speech";

export function useSpeech() {
  const [available, setAvailable] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [engine, setEngine] = useState<SpeechEngine | null>(null);
  const mounted = useRef(true);
  const runId = useRef(0);

  useEffect(() => {
    mounted.current = true;
    setAvailable(true);
    warmUpVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = warmUpVoices;
    }
    void getTtsStatus();

    return () => {
      mounted.current = false;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      stopSpeech();
    };
  }, []);

  const speakText = useCallback(async (text: string, options?: SayOptions) => {
    const id = ++runId.current;
    setSpeaking(true);
    try {
      const used = await say(text, options);
      if (mounted.current && id === runId.current) setEngine(used);
    } finally {
      if (mounted.current && id === runId.current) setSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    runId.current += 1;
    stopSpeech();
    if (mounted.current) setSpeaking(false);
  }, []);

  return { available, speaking, engine, say: speakText, stop };
}

export default useSpeech;
