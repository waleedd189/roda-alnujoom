"use client";
import Link from "next/link";
import { useState } from "react";
import { subjects } from "@/data";
import { useProgress } from "@/hooks/useProgress";
import StarDisplay from "@/components/StarDisplay";
import type { AgeGroup, SubjectKey } from "@/types";

const AGE_GROUPS: { label: string; value: AgeGroup; desc: string }[] = [
  { label: "5-6",   value: "5-6",   desc: "KG / روضة" },
  { label: "7-8",   value: "7-8",   desc: "أول / تاني" },
  { label: "9-10",  value: "9-10",  desc: "تالت / رابع" },
  { label: "11-12", value: "11-12", desc: "خامس / سادس" },
];

const AGE_MIN: Record<AgeGroup, number> = {
  "5-6":   5,
  "7-8":   7,
  "9-10":  9,
  "11-12": 11,
};

const SUBJECT_KEYS: SubjectKey[] = ["arabic", "english", "math", "quran"];

const SUBJECT_STYLES: Record<SubjectKey, string> = {
  arabic:  "from-red-400  to-orange-400",
  english: "from-blue-400 to-indigo-500",
  math:    "from-emerald-400 to-cyan-400",
  quran:   "from-violet-500 to-purple-600",
};

export default function HomePage() {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("5-6");
  const { totalStars, getStarsForLesson, loading } = useProgress();

  const ageMin = AGE_MIN[ageGroup];

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-50 bg-gradient-to-l from-violet-700 to-purple-600 shadow-lg shadow-purple-300/40">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-300 font-black text-xl tracking-wide">
            <span className="text-2xl">⭐</span>
            <span>روضة النجوم</span>
          </div>
          {!loading && (
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-yellow-300 font-bold text-sm">
              ⭐ {totalStars} نجمة
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 pb-10">

        {/* ── Hero ── */}
        <div className="text-center py-7">
          <span className="text-7xl block animate-bounce-in">🌈</span>
          <h1 className="text-2xl font-black text-violet-700 mt-3 leading-snug">
            أهلاً! اختار المادة وابدأ تتعلم
          </h1>
          <p className="text-gray-500 text-sm mt-1">تعلّم وانبسط يوميًا مع روضة النجوم</p>
        </div>

        {/* ── Age Selector ── */}
        <section className="mb-6">
          <p className="text-sm font-bold text-gray-500 mb-2 text-center">اختار المستوى</p>
          <div className="grid grid-cols-4 gap-2">
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag.value}
                onClick={() => setAgeGroup(ag.value)}
                className={`
                  py-2.5 rounded-2xl border-2 text-center transition-all duration-200 active:scale-95
                  ${ageGroup === ag.value
                    ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-300"
                    : "bg-white border-gray-200 text-gray-600 hover:border-violet-400"}
                `}
              >
                <span className="block text-sm font-black">{ag.label}</span>
                <span className="block text-[10px] opacity-75">{ag.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Subjects Grid ── */}
        <section className="grid grid-cols-2 gap-4">
          {SUBJECT_KEYS.map((key) => {
            const subj = subjects[key];
            const availableLessons = subj.lessons.filter((l) => l.ageMin <= ageMin);
            const completedCount   = availableLessons.filter(
              (l) => getStarsForLesson(l.id) > 0
            ).length;

            return (
              <Link
                key={key}
                href={`/${key}?age=${ageGroup}`}
                className={`
                  relative rounded-4xl p-6 flex flex-col items-center gap-2 text-white
                  bg-gradient-to-br ${SUBJECT_STYLES[key]}
                  shadow-md active:scale-95 transition-transform duration-200
                `}
              >
                {/* progress badge */}
                {availableLessons.length > 0 && (
                  <span className="absolute top-2 left-2 bg-white/25 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {completedCount}/{availableLessons.length}
                  </span>
                )}

                <span className="text-5xl">{subj.icon}</span>
                <span className="text-lg font-black">{subj.name}</span>
                <span className="text-xs opacity-85 text-center">{subj.subtitle}</span>

                {availableLessons.length > 0 && (
                  <div className="w-full bg-white/30 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-white h-full rounded-full transition-all"
                      style={{ width: `${(completedCount / availableLessons.length) * 100}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </section>

        {/* ── Motivational footer ── */}
        <p className="text-center text-gray-400 text-sm mt-8">
          ✨ كل درس بيخليك أذكى وأحسن — استمر!
        </p>
      </main>
    </div>
  );
}
