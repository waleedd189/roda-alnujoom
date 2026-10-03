"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { primeAudio } from "@/lib/audioPlayer";
import { unlockAudio } from "@/lib/sfx";
import { warmUpVoices } from "@/lib/speech";

/**
 * المتصفحات بتمنع أي صوت قبل أول لمسة من المستخدم.
 * الكمبوننت ده بيفك القفل من أول لمسة، وبيوضّح للطفل
 * إنه لازم يضغط عشان يسمع.
 */
export default function AudioUnlock() {
  const [unlocked, setUnlocked] = useState(true);

  useEffect(() => {
    setUnlocked(false);

    const unlock = () => {
      primeAudio();
      unlockAudio();
      warmUpVoices();
      setUnlocked(true);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  if (unlocked) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[65] flex justify-center px-4">
      <div className="animate-bounce-in flex items-center gap-2 rounded-full bg-violet-600/95 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-500/30 backdrop-blur">
        <Volume2 size={18} className="animate-pulse" />
        👆 المس الشاشة مرة عشان الصوت يشتغل
      </div>
    </div>
  );
}
