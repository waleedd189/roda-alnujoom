"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { subjects } from "@/data";
import { useProgress } from "@/hooks/useProgress";
import StarDisplay from "@/components/StarDisplay";
import type { SubjectKey, AgeGroup } from "@/types";

const AGE_MIN: Record<AgeGroup, number> = {
  "5-6": 5, "7-8": 7, "9-10": 9, "11-12": 11,
};

const LEVEL_LABEL: Record<1 | 2 | 3, string> = {
  1: "سهل 🟢",
  2: "متوسط 🟡",
  3: "متقدم 🔴",
};

interface PageProps {
  params: { subject: string };
}

function SubjectPageInner({ subject }: { subject: string }) {
  // ── All hooks first ───────────────────────────
  const searchParams        = useSearchParams();
  const ageGroup            = (searchParams.get("age") ?? "5-6") as AgeGroup;
  const ageMin              = AGE_MIN[ageGroup];
  const { getStarsForLesson } = useProgress();

  // ── Derived data ──────────────────────────────
  const subj    = subjects[subject as SubjectKey];
  const lessons = subj?.lessons.filter((l) => l.ageMin <= ageMin) ?? [];

  // ── Guard ─────────────────────────────────────
  if (!subj) return <p className="p-8 text-center text-red-500">مادة غير موجودة</p>;

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">

      {/* Header */}
      <header className={`${subj.headerClass} sticky top-0 z-50 shadow-lg`}>
        <div className="max-w-xl mx-auto px-4 pt-3 pb-5">
          <Link
            href={`/?age=${ageGroup}`}
            className="inline-flex items-center gap-1 bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={16} />
            رجوع
          </Link>
          <div className="text-center mt-3">
            <span className="text-4xl block">{subj.icon}</span>
            <h1 className="text-2xl font-black text-white mt-1">{subj.name}</h1>
            <p className="text-white/80 text-sm">{subj.subtitle}</p>
          </div>
        </div>
      </header>

      {/* Lessons list */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-5 flex flex-col gap-3">
        {lessons.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">🔒</span>
            <p className="font-bold">مفيش دروس لهذا المستوى دلوقتي</p>
            <p className="text-sm mt-1">اختار مستوى أصغر من الصفحة الرئيسية</p>
          </div>
        )}

        {lessons.map((lesson) => {
          const stars = getStarsForLesson(lesson.id);

          return (
            <Link
              key={lesson.id}
              href={`/${subject}/${lesson.id}?age=${ageGroup}`}
              className="flex items-center gap-4 bg-white rounded-3xl px-5 py-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
            >
              <span className="text-4xl flex-shrink-0">{lesson.icon}</span>

              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-800 text-base leading-snug">{lesson.name}</p>
                <p className="text-gray-500 text-sm mt-0.5">{lesson.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StarDisplay earned={stars} size="sm" />
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {LEVEL_LABEL[lesson.level]}
                  </span>
                </div>
              </div>

              <ChevronLeft size={20} className="text-gray-300 flex-shrink-0 rotate-180" />
            </Link>
          );
        })}
      </main>
    </div>
  );
}

export default function SubjectPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-violet-600 font-bold text-lg">⏳ جاري التحميل...</div>}>
      <SubjectPageInner subject={params.subject} />
    </Suspense>
  );
}
