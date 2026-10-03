"use client";

// ────────────────────────────────────────────────
//  مؤثرات صوتية مولّدة بالـ Web Audio API
//  (من غير أي ملفات — حجم صفر ونفس الجودة)
// ────────────────────────────────────────────────

import { getSettings } from "./settings";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  freq: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
}

function tone({ freq, start, duration, type = "sine", gain = 0.18, slideTo }: ToneOpts) {
  const audio = getCtx();
  if (!audio) return;

  const t0 = audio.currentTime + start;
  const osc = audio.createOscillator();
  const vol = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);

  vol.gain.setValueAtTime(0.0001, t0);
  vol.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(vol).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function enabled() {
  return getSettings().sfx;
}

/** إجابة صحيحة — ثلاث نغمات صاعدة */
export function sfxCorrect() {
  if (!enabled()) return;
  tone({ freq: 523.25, start: 0, duration: 0.14 });
  tone({ freq: 659.25, start: 0.1, duration: 0.14 });
  tone({ freq: 783.99, start: 0.2, duration: 0.28, gain: 0.2 });
}

/** إجابة غلط — نغمة هابطة لطيفة (مش مخيفة) */
export function sfxWrong() {
  if (!enabled()) return;
  tone({ freq: 320, start: 0, duration: 0.18, type: "triangle", gain: 0.14, slideTo: 200 });
}

/** إنهاء الدرس — لحن احتفال قصير */
export function sfxWin() {
  if (!enabled()) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => tone({ freq: f, start: i * 0.11, duration: 0.3, gain: 0.17 }));
  tone({ freq: 1318.5, start: 0.5, duration: 0.5, gain: 0.14 });
}

/** نجمة اتكسبت */
export function sfxStar() {
  if (!enabled()) return;
  tone({ freq: 880, start: 0, duration: 0.12, type: "triangle" });
  tone({ freq: 1318.5, start: 0.08, duration: 0.2, type: "triangle", gain: 0.13 });
}

/** ضغطة زرار */
export function sfxTap() {
  if (!enabled()) return;
  tone({ freq: 660, start: 0, duration: 0.06, type: "square", gain: 0.06 });
}

/** تنشيط الصوت بعد أول تفاعل من المستخدم (سياسة المتصفحات) */
export function unlockAudio() {
  getCtx();
}
