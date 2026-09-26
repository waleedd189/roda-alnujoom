"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { subjects } from "@/data";
import { useProgress } from "@/hooks/useProgress";
import ProgressBar from "@/components/ProgressBar";
import FlashCard  from "@/components/FlashCard";
import Quiz       from "@/components/Quiz";
import MatchGame  from "@/components/MatchGame";
import CountGame  from "@/components/CountGame";
import FillGame   from "@/components/FillGame";
import StarDisplay from "@/components/StarDisplay";
import type { SubjectKey, AgeGroup, FlashCardItem, QuizItem, MatchPair, CountItem, FillItem } from "@/types";

interface PageProps {
  params: { subject: string; lesson: string };
}

function LessonPageInner({ subject, lessonId }: { subject: string; lessonId: string }) {
  // ── All hooks first (Rules of Hooks) ──────────
  const searchParams                    = useSearchParams();
  const ageGroup                        = (searchParams.get("age") ?? "5-6") as AgeGroup;
  const { completeLesson }              = useProgress();
  const [done, setDone]                 = useState(false);
  const [starsEarned, setStarsEarned]   = useState(0);

  // ── Derived data ──────────────────────────────
  const subj   = subjects[subject as SubjectKey];
  const lesson = subj?.lessons.find((l) => l.id === lessonId);

  // ── Handlers ─────────────────────────────────
  const handleComplete = async (stars: number) => {
    if (!lesson) return;
    setStarsEarned(stars);
    setDone(true);
    await completeLesson(lesson.id, stars);
  };

  // ── Guards (after all hooks) ──────────────────
  if (!subj)   return <p className="p-8 text-red-500 text-center">مادة غير موجودة</p>;
  if (!lesson) return <p className="p-8 text-red-500 text-center">الدرس غير موجود</p>;

  // ── Completion screen ────────────────────────
  if (done) {
    const messages = ["ممتاز جداً! 🌟", "عبقري صغير! 🧠", "أنت نجم! ⭐", "رائع! استمر! 🚀"];
    const msg = messages[Math.floor(Math.random() * messages.length)]!;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" dir="rtl">
        <span className="text-8xl animate-spin-once block mb-4">🏆</span>
        <h2 className="text-2xl font-black text-violet-700">{msg}</h2>
        <p className="text-gray-500 mt-1">خلصت: {lesson.name}</p>
        <StarDisplay earned={starsEarned} size="lg" />
        <div className="flex gap-3 mt-6">
          <Link
            href={`/${subject}?age=${ageGroup}`}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-3xl font-bold active:scale-95 transition-transform"
          >
            ◀ الدروس
          </Link>
          <Link
            href={`/?age=${ageGroup}`}
            className="px-6 py-3 bg-violet-600 text-white rounded-3xl font-bold active:scale-95 transition-transform"
          >
            🏠 الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // ── Lesson screen ────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">

      {/* Header */}
      <header className={`${subj.headerClass} sticky top-0 z-50 shadow-md`}>
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/${subject}?age=${ageGroup}`}
              className="bg-white/20 text-white rounded-full p-1.5 hover:bg-white/30 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={18} />
            </Link>
            <h1 className="text-lg font-black text-white flex-1 text-center">{lesson.name}</h1>
            <div className="w-8" /> {/* spacer */}
          </div>
          <div className="mt-2">
            <ProgressBar current={0} total={1} />
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-5">
        {lesson.type === "flashcard" && (
          <FlashCard
            items={lesson.data as FlashCardItem[]}
            onComplete={handleComplete}
          />
        )}
        {lesson.type === "quiz" && (
          <Quiz
            items={lesson.data as QuizItem[]}
            onComplete={handleComplete}
          />
        )}
        {lesson.type === "match" && (
          <MatchGame
            pairs={lesson.data as MatchPair[]}
            onComplete={handleComplete}
          />
        )}
        {lesson.type === "count" && (
          <CountGame
            items={lesson.data as CountItem[]}
            onComplete={handleComplete}
          />
        )}
        {lesson.type === "fill" && (
          <FillGame
            items={lesson.data as FillItem[]}
            onComplete={handleComplete}
          />
        )}
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
