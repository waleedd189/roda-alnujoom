"use client";

// ────────────────────────────────────────────────
//  مشغّل صوت موحّد — عنصر <audio> واحد لكل التطبيق
//  بيمنع تداخل الأصوات ويدعم روابط احتياطية
// ────────────────────────────────────────────────

let el: HTMLAudioElement | null = null;
let token = 0;
const listeners = new Set<(playing: boolean) => void>();

function notify(playing: boolean) {
  listeners.forEach((fn) => fn(playing));
}

function getEl(): HTMLAudioElement {
  if (!el) {
    el = new Audio();
    el.preload = "auto";
    el.addEventListener("ended", () => notify(false));
    el.addEventListener("pause", () => notify(false));
    el.addEventListener("playing", () => notify(true));
  }
  return el;
}

export function onPlaybackChange(fn: (playing: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function stopAudio(): void {
  token += 1;
  if (!el) return;
  el.pause();
  try {
    el.currentTime = 0;
  } catch {
    /* ignore */
  }
  notify(false);
}

export function isPlaying(): boolean {
  return Boolean(el && !el.paused && !el.ended);
}

/**
 * تشغيل أول رابط شغال من قائمة روابط.
 * بيرجع Promise بينتهي لما الصوت يخلص.
 * بيرمي Error لو كل الروابط فشلت.
 */
export function playSources(sources: string[], opts?: { rate?: number; volume?: number }): Promise<void> {
  stopAudio();
  const myToken = token;
  const audio = getEl();
  audio.playbackRate = opts?.rate ?? 1;
  audio.volume = opts?.volume ?? 1;

  return new Promise<void>((resolve, reject) => {
    let i = 0;

    const cleanup = () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };

    const onEnded = () => {
      if (myToken !== token) return;
      cleanup();
      notify(false);
      resolve();
    };

    const onError = () => {
      if (myToken !== token) {
        cleanup();
        resolve();
        return;
      }
      i += 1;
      if (i < sources.length) {
        audio.src = sources[i]!;
        audio.load();
        void audio.play().catch(onError);
      } else {
        cleanup();
        notify(false);
        reject(new Error("audio-failed"));
      }
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    audio.src = sources[0]!;
    audio.load();
    void audio.play().catch(() => {
      // ممكن يكون منع تشغيل تلقائي من المتصفح
      if (myToken !== token) return;
      onError();
    });
  });
}

/**
 * "فك قفل" الصوت: المتصفحات بتمنع تشغيل أي صوت قبل ما المستخدم
 * يلمس الشاشة. بنشغّل ملف صامت جوه أول لمسة عشان بعد كده
 * نقدر نشغّل الصوت برمجيًا (مهم جدًا على iPhone/Safari).
 */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

let primed = false;

export function primeAudio(): void {
  if (primed || typeof window === "undefined") return;
  primed = true;
  const audio = getEl();
  const prevVolume = audio.volume;
  audio.muted = true;
  audio.src = SILENT_WAV;
  void audio
    .play()
    .catch(() => {
      primed = false;
    })
    .finally(() => {
      audio.pause();
      audio.muted = false;
      audio.volume = prevVolume;
    });

  // تهيئة محرك النطق كمان (Safari محتاج نداء جوه اللمسة)
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.getVoices();
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

export function isAudioPrimed(): boolean {
  return primed;
}

export function playUrl(url: string, opts?: { rate?: number; volume?: number }): Promise<void> {
  return playSources([url], opts);
}
