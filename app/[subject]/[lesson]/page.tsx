"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Home, RotateCcw, Sparkles } from "lucide-react";
import { subjects } from "@/data";
import { useProgress } from "@/hooks/useProgress";
import FlashCard from "@/components/FlashCard";
import Quiz from "@/components/Quiz";
import MatchGame from "@/components/MatchGame";
import CountGame from "@/components/CountGame";
import FillGame from "@/components/FillGame";
import StarDisplay from "@/components/StarDisplay";
import type {
  AgeGroup,
  CountItem,
  FillItem,
  FlashCardItem,
  LessonType,
  MatchPair,
  QuizItem,
  SubjectKey,
} from "@/types";

interface PageProps {
  params: { subject: string; lesson: string };
}

const LEVEL_LABEL: Record<1 | 2 | 3, string> = {
  1: "سهل",
  2: "متوسط",
  3: "متقدم",
};

const TYPE_LABEL: Record<LessonType, string> = {
  flashcard: "بطاقات تعليمية",
  quiz: "اختبار سريع",
  match: "لعبة مطابقة",
  count: "لعبة العد",
  fill: "أكمل الجملة",
};

function isAgeGroup(value: string | null): value is AgeGroup {
  return value === "5-6" || value === "7-8" || value === "9-10" || value === "11-12";
}

function LessonPageInner({ subject, lessonId }: { subject: string; lessonId: string }) {
  const searchParams = useSearchParams();
  const ageParam = searchParams.get("age");
  const ageGroup: AgeGroup = isAgeGroup(ageParam) ? ageParam : "5-6";
  const { completeLesson, getStarsForLesson } = useProgress();
  const [done, setDone] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [previousBest, setPreviousBest] = useState(0);

  const subj = subjects[subject as SubjectKey];
  const lesson = subj?.lessons.find((item) => item.id === lessonId);
  const bestStars = lesson ? getStarsForLesson(lesson.id) : 0;

  const handleComplete = async (stars: number) => {
    if (!lesson) return;
    setPreviousBest(getStarsForLesson(lesson.id));
    setStarsEarned(stars);
    await completeLesson(lesson.id, stars);
    setDone(true);
  };

  const handleRestart = () => {
    setStarsEarned(0);
    setDone(false);
  };

  if (!subj) return <p className="p-8 text-red-500 text-center">مادة غير موجودة</p>;
  if (!lesson) return <p className="p-8 text-red-500 text-center">الدرس غير موجود</p>;

  if (done) {
    const messages = ["ممتاز جداً! 🌟", "عبقري صغير! 🧠", "أنت نجم! ⭐", "رائع! استمر! 🚀"];
    const msg = messages[Math.floor(Math.random() * messages.length)]!;
    const improved = starsEarned > previousBest;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 text-center" dir="rtl">
        <div className="glass-card w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 overflow-hidden relative">
          <div className="absolute -top-12 -left-10 text-[9rem] opacity-10">⭐</div>
          <span className="text-8xl animate-spin-once block mb-4">🏆</span>
          <p className="inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-700 px-4 py-2 text-sm font-black">
            <Sparkles size={16} /> الدرس اكتمل
          </p>
          <h2 className="text-3xl font-black text-violet-700 mt-4">{msg}</h2>
          <p className="text-gray-500 mt-2">خلصت: {lesson.name}</p>

          <div className="my-6 rounded-[2rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500 mb-2">نجومك في المحاولة</p>
            <StarDisplay earned={starsEarned} size="lg" />
            <p className="text-sm text-gray-500 mt-3">
              {improved ? "حققت رقمًا أفضل! التقدم محفوظ على الجهاز 💾" : "التقدم محفوظ، وتقدر تعيد الدرس لتحسن نتيجتك."}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-violet-700 rounded-3xl font-black border border-violet-100 shadow-sm active:scale-95 transition-transform"
            >
              <RotateCcw size={18} /> إعادة
            </button>
            <Link
              href={`/${subject}?age=${ageGroup}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-3xl font-black active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} /> الدروس
            </Link>
            <Link
              href={`/?age=${ageGroup}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 text-white rounded-3xl font-black shadow-lg shadow-violet-200 active:scale-95 transition-transform"
            >
              <Home size={18} /> الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <header className={`${subj.headerClass} sticky top-0 z-50 shadow-md relative overflow-hidden`}>
        <div className="absolute -top-12 -left-8 text-[8rem] opacity-10">{lesson.icon}</div>
        <div className="max-w-4xl mx-auto px-4 py-3 relative z-10">
          <div className="flex items-center gap-3">
            <Link
              href={`/${subject}?age=${ageGroup}`}
              className="bg-white/20 text-white rounded-full p-2 hover:bg-white/30 transition-colors flex-shrink-0"
              aria-label="رجوع للدروس"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="flex-1 text-center">
              <p className="text-white/70 text-xs font-bold">{TYPE_LABEL[lesson.type]} · {LEVEL_LABEL[lesson.level]}</p>
              <h1 className="text-lg sm:text-xl font-black text-white leading-snug">{lesson.name}</h1>
            </div>
            <div className="w-9" />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-white/90">
            <span className="rounded-full bg-white/20 px-3 py-1">{lesson.description}</span>
            <span className="rounded-full bg-white/20 px-3 py-1">أفضل نتيجة: {bestStars} ⭐</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-5 safe-bottom">
        <div className="glass-card rounded-[2rem] p-4 sm:p-6">
          {lesson.type === "flashcard" && (
            <FlashCard items={lesson.data as FlashCardItem[]} onComplete={handleComplete} />
          )}
          {lesson.type === "quiz" && (
            <Quiz items={lesson.data as QuizItem[]} onComplete={handleComplete} />
          )}
          {lesson.type === "match" && (
            <MatchGame pairs={lesson.data as MatchPair[]} onComplete={handleComplete} />
          )}
          {lesson.type === "count" && (
            <CountGame items={lesson.data as CountItem[]} onComplete={handleComplete} />
          )}
          {lesson.type === "fill" && (
            <FillGame items={lesson.data as FillItem[]} onComplete={handleComplete} />
          )}
        </div>
      </main>
    </div>
  );
}

export default function LessonPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-violet-600 font-bold text-lg">⏳ جاري التحميل...</div>}>
      <LessonPageInner subject={params.subject} lessonId={params.lesson} />
    </Suspense>
  );
}
