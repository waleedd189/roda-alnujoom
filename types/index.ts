// ────────────────────────────────────────────────
//  Shared Types — Roda Al-Nujoom
// ────────────────────────────────────────────────

export type SubjectKey = "arabic" | "english" | "math" | "quran";
export type AgeGroup = "5-6" | "7-8" | "9-10" | "11-12";
export type DifficultyLevel = 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
export type LessonType = "flashcard" | "quiz" | "match" | "count" | "fill";

// ── Flashcard ──────────────────────────────────
export interface FlashCardItem {
  emoji: string;
  main: string;        // e.g. "أ"  or "A"
  sub: string;         // e.g. "أَسَد" or "Apple"
  color: string;       // tailwind bg class or hex
  audio?: string;      // optional audio file path in /public/audio/
  example?: string;    // example sentence
}

// ── Quiz ───────────────────────────────────────
export interface QuizItem {
  question: string;
  icon: string;
  options: string[];
  correctIndex: number;
  explanation?: string;  // shown after answering
  audio?: string;
}

// ── Match ──────────────────────────────────────
export interface MatchPair {
  left: string;          // word / emoji
  right: string;         // translation / picture
  audio?: string;
}

// ── Count ──────────────────────────────────────
export interface CountItem {
  emoji: string;
  count: number;
  options: number[];
}

// ── Fill-in-the-blank ─────────────────────────
export interface FillItem {
  sentence: string;       // "ال___ تلمع في الليل"
  answer: string;         // "نجوم"
  hint?: string;
  options: string[];      // 4 choices
}

// ── Lesson ─────────────────────────────────────
export interface Lesson {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  icon: string;
  type: LessonType;
  level: DifficultyLevel;
  ageMin: number;         // minimum age in years
  data: FlashCardItem[] | QuizItem[] | MatchPair[] | CountItem[] | FillItem[];
}

// ── Subject ────────────────────────────────────
export interface Subject {
  key: SubjectKey;
  name: string;
  nameEn: string;
  subtitle: string;
  icon: string;
  color: string;          // tailwind gradient class
  headerClass: string;
  lessons: Lesson[];
}

// ── Progress (stored in Firestore) ─────────────
export interface LessonProgress {
  lessonId: string;
  starsEarned: number;    // 0-3
  completedAt: Date;
  attempts: number;
}

export interface UserProgress {
  userId: string;         // anonymous uid from Firebase Auth
  totalStars: number;
  currentAgeGroup: AgeGroup;
  lessonProgress: Record<string, LessonProgress>;
  lastActiveAt: Date;
}
