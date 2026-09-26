"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Sparkles, Trophy, UsersRound } from "lucide-react";
import { subjects } from "@/data";
import { useProgress } from "@/hooks/useProgress";
import StarDisplay from "@/components/StarDisplay";
import type { AgeGroup, Lesson, SubjectKey } from "@/types";

const AGE_GROUPS: { label: string; value: AgeGroup; desc: string; emoji: string }[] = [
  { label: "5-6", value: "5-6", desc: "KG / روضة", emoji: "🧸" },
  { label: "7-8", value: "7-8", desc: "أول / تاني", emoji: "🎒" },
  { label: "9-10", value: "9-10", desc: "تالت / رابع", emoji: "📚" },
  { label: "11-12", value: "11-12", desc: "خامس / سادس", emoji: "🚀" },
];

const AGE_MIN: Record<AgeGroup, number> = {
  "5-6": 5,
  "7-8": 7,
  "9-10": 9,
  "11-12": 11,
};

const SUBJECT_KEYS: SubjectKey[] = ["arabic", "english", "math", "quran"];

const SUBJECT_STYLES: Record<SubjectKey, { gradient: string; glow: string; badge: string }> = {
  arabic: {
    gradient: "from-rose-400 via-orange-400 to-amber-400",
    glow: "shadow-orange-200/80",
    badge: "bg-orange-100 text-orange-700",
  },
  english: {
    gradient: "from-sky-400 via-blue-500 to-indigo-500",
    glow: "shadow-blue-200/80",
    badge: "bg-blue-100 text-blue-700",
  },
  math: {
    gradient: "from-emerald-400 via-teal-400 to-cyan-400",
    glow: "shadow-emerald-200/80",
    badge: "bg-emerald-100 text-emerald-700",
  },
  quran: {
    gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
    glow: "shadow-violet-200/80",
    badge: "bg-violet-100 text-violet-700",
  },
};

function isAgeGroup(value: string | null): value is AgeGroup {
  return value === "5-6" || value === "7-8" || value === "9-10" || value === "11-12";
}

function getLessonVerb(lesson?: Lesson) {
  if (!lesson) return "ابدأ";
  if (lesson.type === "quiz") return "حل الاختبار";
  if (lesson.type === "match") return "العب المطابقة";
  if (lesson.type === "count") return "ابدأ العد";
  if (lesson.type === "fill") return "أكمل الجمل";
  return "افتح البطاقات";
}

export default function HomePage() {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("5-6");
  const {
    totalStars,
    getStarsForLesson,
    loading,
    setCurrentAgeGroup,
    currentAgeGroup,
    storageMode,
  } = useProgress();

  useEffect(() => {
    setAgeGroup(currentAgeGroup);
  }, [currentAgeGroup]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const age = params.get("age");
    if (isAgeGroup(age)) {
      setAgeGroup(age);
      setCurrentAgeGroup(age);
    }
  }, [setCurrentAgeGroup]);

  const ageMin = AGE_MIN[ageGroup];

  const subjectSummaries = useMemo(() => {
    return SUBJECT_KEYS.map((key) => {
      const subj = subjects[key];
      const availableLessons = subj.lessons.filter((lesson) => lesson.ageMin <= ageMin);
      const completedCount = availableLessons.filter((lesson) => getStarsForLesson(lesson.id) > 0).length;
      const stars = availableLessons.reduce((sum, lesson) => sum + getStarsForLesson(lesson.id), 0);
      const nextLesson = availableLessons.find((lesson) => getStarsForLesson(lesson.id) === 0) ?? availableLessons[0];

      return {
        key,
        subj,
        availableLessons,
        completedCount,
        stars,
        nextLesson,
        progressPct: availableLessons.length > 0 ? Math.round((completedCount / availableLessons.length) * 100) : 0,
      };
    });
  }, [ageMin, getStarsForLesson]);

  const stats = useMemo(() => {
    const totalLessons = subjectSummaries.reduce((sum, item) => sum + item.availableLessons.length, 0);
    const completedLessons = subjectSummaries.reduce((sum, item) => sum + item.completedCount, 0);
    const totalPossibleStars = totalLessons * 3;
    const earnedStars = subjectSummaries.reduce((sum, item) => sum + item.stars, 0);
    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return { totalLessons, completedLessons, earnedStars, totalPossibleStars, progressPct };
  }, [subjectSummaries]);

  const dailySubject = subjectSummaries.find((item) => item.nextLesson && getStarsForLesson(item.nextLesson.id) === 0)
    ?? subjectSummaries.find((item) => item.nextLesson);
  const dailyLesson = dailySubject?.nextLesson;

  const handleAgeChange = (nextAge: AgeGroup) => {
    setAgeGroup(nextAge);
    setCurrentAgeGroup(nextAge);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" dir="rtl">
      <header className="sticky top-0 z-50 bg-gradient-to-l from-violet-800 via-purple-700 to-fuchsia-600 shadow-lg shadow-purple-300/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-yellow-300 font-black text-xl tracking-wide">
            <span className="text-2xl animate-float">⭐</span>
            <span>روضة النجوم</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 bg-white/15 text-white rounded-full px-3 py-1.5 text-xs font-bold">
              {storageMode === "local" ? "💾 حفظ محلي" : "☁️ متصل"}
            </span>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-yellow-300 font-bold text-sm">
              ⭐ {loading ? "..." : totalStars} نجمة
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 safe-bottom">
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4 lg:gap-6 items-stretch">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-500 p-6 sm:p-8 text-white shadow-2xl shadow-violet-300/40 shine-overlay">
            <div className="absolute -top-10 -left-8 text-9xl opacity-20">🌈</div>
            <div className="absolute bottom-4 left-5 hidden sm:block text-5xl animate-float">🪄</div>
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2 text-sm font-bold text-yellow-100">
                <Sparkles size={16} /> نسخة MVP ممتعة للأطفال
              </span>
              <h1 className="mt-5 text-3xl sm:text-5xl font-black leading-tight">
                اتعلم، العب، واجمع النجوم كل يوم
              </h1>
              <p className="mt-3 text-white/85 text-base sm:text-lg leading-8">
                رحلة تعليمية بالعربي والإنجليزي والرياضيات والقرآن، مع تقدم محفوظ على نفس الجهاز بدون Firebase حاليًا.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg">
                <div className="rounded-3xl bg-white/15 p-3 text-center">
                  <p className="text-2xl font-black">{stats.totalLessons}</p>
                  <p className="text-xs text-white/75">درس متاح</p>
                </div>
                <div className="rounded-3xl bg-white/15 p-3 text-center">
                  <p className="text-2xl font-black">{stats.completedLessons}</p>
                  <p className="text-xs text-white/75">درس مكتمل</p>
                </div>
                <div className="rounded-3xl bg-white/15 p-3 text-center">
                  <p className="text-2xl font-black">{stats.progressPct}%</p>
                  <p className="text-xs text-white/75">إنجاز</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="glass-card rounded-[2.25rem] p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-violet-500">مهمة اليوم</p>
                  <h2 className="text-2xl font-black text-gray-900 mt-1">
                    {dailyLesson ? dailyLesson.name : "كل الدروس مكتملة"}
                  </h2>
                </div>
                <span className="text-5xl">{dailyLesson?.icon ?? "🏆"}</span>
              </div>
              <p className="text-gray-500 text-sm leading-7 mt-3">
                {dailyLesson
                  ? dailyLesson.description
                  : "رائع! اختار أي مادة وراجع الدروس للحصول على نتيجة أفضل."}
              </p>
            </div>

            {dailyLesson && dailySubject ? (
              <Link
                href={`/${dailySubject.key}/${dailyLesson.id}?age=${ageGroup}`}
                className="group flex items-center justify-between rounded-3xl bg-violet-600 px-5 py-4 text-white font-black shadow-lg shadow-violet-200 active:scale-[0.98] transition-all"
              >
                <span>{getLessonVerb(dailyLesson)}</span>
                <span className="transition-transform group-hover:-translate-x-1">←</span>
              </Link>
            ) : (
              <Link
                href={`/quran?age=${ageGroup}`}
                className="rounded-3xl bg-violet-600 px-5 py-4 text-center text-white font-black shadow-lg shadow-violet-200 active:scale-[0.98] transition-all"
              >
                راجع الدروس 🌟
              </Link>
            )}
          </aside>
        </section>

        <section className="glass-card rounded-[2rem] p-4 sm:p-5 mt-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-bold text-gray-500">اختار المرحلة المناسبة</p>
              <h2 className="text-xl font-black text-gray-900">المستوى الحالي: {ageGroup} سنوات</h2>
            </div>
            <UsersRound className="text-violet-500" size={24} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag.value}
                onClick={() => handleAgeChange(ag.value)}
                className={`py-3 rounded-3xl border-2 text-center transition-all duration-200 active:scale-95
                  ${ageGroup === ag.value
                    ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200"
                    : "bg-white border-gray-100 text-gray-600 hover:border-violet-300 hover:bg-violet-50"}`}
              >
                <span className="block text-2xl">{ag.emoji}</span>
                <span className="block text-sm font-black mt-1">{ag.label}</span>
                <span className="block text-[11px] opacity-75">{ag.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-bold text-violet-500 flex items-center gap-1">
                <BookOpen size={16} /> المواد التعليمية
              </p>
              <h2 className="text-2xl font-black text-gray-900">اختار مادة وابدأ اللعب</h2>
            </div>
            <StarDisplay earned={Math.min(3, Math.floor(totalStars / 6))} size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectSummaries.map(({ key, subj, availableLessons, completedCount, stars, progressPct, nextLesson }) => {
              const style = SUBJECT_STYLES[key];
              const isComplete = availableLessons.length > 0 && completedCount === availableLessons.length;

              return (
                <Link
                  key={key}
                  href={`/${key}?age=${ageGroup}`}
                  className={`relative overflow-hidden rounded-[2rem] p-5 min-h-64 flex flex-col text-white bg-gradient-to-br ${style.gradient} shadow-xl ${style.glow} active:scale-[0.98] transition-all group`}
                >
                  <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-white/20" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-black/10" />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <span className="text-6xl transition-transform group-hover:scale-110">{subj.icon}</span>
                    <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-black">
                      {completedCount}/{availableLessons.length || 0}
                    </span>
                  </div>

                  <div className="relative z-10 mt-4 flex-1">
                    <h3 className="text-2xl font-black">{subj.name}</h3>
                    <p className="text-sm text-white/85 mt-1 leading-6">{subj.subtitle}</p>
                    {nextLesson && (
                      <p className="mt-3 rounded-2xl bg-white/18 px-3 py-2 text-xs font-bold leading-5">
                        التالي: {nextLesson.name}
                      </p>
                    )}
                  </div>

                  <div className="relative z-10 mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-white/90">
                      <span>{isComplete ? "ممتاز! اكتملت المادة" : `${progressPct}% مكتمل`}</span>
                      <span>{stars} ⭐</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/30 overflow-hidden">
                      <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-[2rem] p-5 flex items-center gap-4">
            <span className="text-4xl">💾</span>
            <div>
              <h3 className="font-black text-gray-900">الحفظ المحلي مفعل</h3>
              <p className="text-sm text-gray-500 leading-6">
                النجوم والتقدم بيتحفظوا على نفس الجهاز. Firebase ممكن يتضاف لاحقًا للمزامنة.
              </p>
            </div>
          </div>
          <div className="glass-card rounded-[2rem] p-5 flex items-center gap-4">
            <Trophy className="text-yellow-500" size={38} />
            <div>
              <h3 className="font-black text-gray-900">هدف النجوم</h3>
              <p className="text-sm text-gray-500 leading-6">
                جمعت {stats.earnedStars} من {stats.totalPossibleStars} نجمة متاحة لهذا المستوى. استمر يا بطل!
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
