"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Clock3, Sparkles, Trophy } from "lucide-react";
import { subjects } from "@/data";
import { useProgress } from "@/hooks/useProgress";
import StarDisplay from "@/components/StarDisplay";
import type { AgeGroup, LessonType, SubjectKey } from "@/types";

const AGE_MIN: Record<AgeGroup, number> = {
  "5-6": 5,
  "7-8": 7,
  "9-10": 9,
  "11-12": 11,
};

const LEVEL_LABEL: Record<1 | 2 | 3, string> = {
  1: "سهل 🟢",
  2: "متوسط 🟡",
  3: "متقدم 🔴",
};

const TYPE_LABEL: Record<LessonType, string> = {
  flashcard: "بطاقات",
  quiz: "اختبار",
  match: "مطابقة",
  count: "عدّ",
  fill: "أكمل",
};

const TYPE_BADGE: Record<LessonType, string> = {
  flashcard: "bg-violet-50 text-violet-700",
  quiz: "bg-amber-50 text-amber-700",
  match: "bg-sky-50 text-sky-700",
  count: "bg-emerald-50 text-emerald-700",
  fill: "bg-rose-50 text-rose-700",
};

interface PageProps {
  params: { subject: string };
}

function isAgeGroup(value: string | null): value is AgeGroup {
  return value === "5-6" || value === "7-8" || value === "9-10" || value === "11-12";
}

function SubjectPageInner({ subject }: { subject: string }) {
  const searchParams = useSearchParams();
  const ageParam = searchParams.get("age");
  const ageGroup: AgeGroup = isAgeGroup(ageParam) ? ageParam : "5-6";
  const ageMin = AGE_MIN[ageGroup];
  const { getStarsForLesson, totalStars } = useProgress();

  const subj = subjects[subject as SubjectKey];
  const lessons = useMemo(
    () => subj?.lessons.filter((lesson) => lesson.ageMin <= ageMin) ?? [],
    [subj, ageMin]
  );

  if (!subj) return <p className="p-8 text-center text-red-500">مادة غير موجودة</p>;

  const completedCount = lessons.filter((lesson) => getStarsForLesson(lesson.id) > 0).length;
  const earnedStars = lessons.reduce((sum, lesson) => sum + getStarsForLesson(lesson.id), 0);
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const recommendedLesson = lessons.find((lesson) => getStarsForLesson(lesson.id) === 0) ?? lessons[0];

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <header className={`${subj.headerClass} relative overflow-hidden sticky top-0 z-50 shadow-lg`}>
        <div className="absolute -top-16 -left-10 text-[10rem] opacity-10">{subj.icon}</div>
        <div className="max-w-5xl mx-auto px-4 pt-3 pb-6 relative z-10">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/?age=${ageGroup}`}
              className="inline-flex items-center gap-1 bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-white/30 transition-colors"
            >
              <ChevronLeft size={16} />
              الرئيسية
            </Link>
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white">
              {ageGroup} سنوات
            </span>
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end mt-5">
            <div>
              <span className="text-5xl block animate-float">{subj.icon}</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">{subj.name}</h1>
              <p className="text-white/85 text-sm sm:text-base mt-1">{subj.subtitle}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 min-w-72">
              <div className="rounded-3xl bg-white/18 p-3 text-center text-white">
                <p className="text-2xl font-black">{lessons.length}</p>
                <p className="text-xs text-white/75">دروس</p>
              </div>
              <div className="rounded-3xl bg-white/18 p-3 text-center text-white">
                <p className="text-2xl font-black">{completedCount}</p>
                <p className="text-xs text-white/75">مكتمل</p>
              </div>
              <div className="rounded-3xl bg-white/18 p-3 text-center text-white">
                <p className="text-2xl font-black">{earnedStars}</p>
                <p className="text-xs text-white/75">نجوم</p>
              </div>
            </div>
          </div>

          <div className="mt-4 h-2.5 rounded-full bg-white/25 overflow-hidden">
            <div className="h-full rounded-full bg-yellow-300 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 safe-bottom">
        {recommendedLesson && (
          <section className="glass-card rounded-[2rem] p-4 sm:p-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{recommendedLesson.icon}</span>
              <div>
                <p className="text-sm font-bold text-violet-500 flex items-center gap-1">
                  <Sparkles size={16} /> الاقتراح التالي
                </p>
                <h2 className="text-xl font-black text-gray-900">{recommendedLesson.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{recommendedLesson.description}</p>
              </div>
            </div>
            <Link
              href={`/${subject}/${recommendedLesson.id}?age=${ageGroup}`}
              className="rounded-3xl bg-violet-600 px-5 py-3 text-center text-white font-black shadow-lg shadow-violet-200 active:scale-[0.98] transition-all"
            >
              ابدأ الآن ←
            </Link>
          </section>
        )}

        {lessons.length === 0 && (
          <div className="glass-card rounded-[2rem] text-center py-16 text-gray-500">
            <span className="text-6xl block mb-3">🔒</span>
            <p className="font-black text-lg">مفيش دروس لهذا المستوى دلوقتي</p>
            <p className="text-sm mt-1">اختار مستوى أصغر من الصفحة الرئيسية</p>
          </div>
        )}

        <section className="grid md:grid-cols-2 gap-3">
          {lessons.map((lesson, index) => {
            const stars = getStarsForLesson(lesson.id);
            const completed = stars > 0;

            return (
              <Link
                key={lesson.id}
                href={`/${subject}/${lesson.id}?age=${ageGroup}`}
                className="group relative overflow-hidden flex items-center gap-4 bg-white rounded-[1.75rem] px-5 py-4 shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 border border-white"
              >
                <span className="absolute top-3 left-4 text-xs font-black text-gray-300">#{index + 1}</span>
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-50 to-amber-50 flex items-center justify-center text-4xl flex-shrink-0 shadow-inner">
                  {lesson.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[11px] font-black rounded-full px-2 py-1 ${TYPE_BADGE[lesson.type]}`}>
                      {TYPE_LABEL[lesson.type]}
                    </span>
                    <span className="text-[11px] text-gray-500 bg-gray-100 rounded-full px-2 py-1 font-bold">
                      {LEVEL_LABEL[lesson.level]}
                    </span>
                  </div>
                  <p className="font-black text-gray-900 text-base leading-snug">{lesson.name}</p>
                  <p className="text-gray-500 text-sm mt-0.5 leading-6">{lesson.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarDisplay earned={stars} size="sm" />
                    {completed ? (
                      <span className="text-xs text-green-600 font-bold">مكتمل</span>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock3 size={12} /> جاهز للبدء
                      </span>
                    )}
                  </div>
                </div>

                <ChevronLeft size={20} className="text-gray-300 flex-shrink-0 rotate-180 transition-transform group-hover:-translate-x-1" />
              </Link>
            );
          })}
        </section>

        <div className="mt-5 glass-card rounded-[2rem] p-5 flex items-center gap-4 text-gray-600">
          <Trophy className="text-yellow-500 flex-shrink-0" size={36} />
          <p className="text-sm leading-7">
            مجموع نجومك في التطبيق كله: <strong className="text-violet-700">{totalStars} نجمة</strong>. كل درس تخلصه بأفضل نتيجة يزود رصيدك.
          </p>
        </div>
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
