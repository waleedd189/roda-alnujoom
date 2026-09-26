"use client";
import { useState, useEffect } from "react";
import { ensureAuth, getProgress, initProgress, saveLessonProgress } from "@/lib/progress";
import type { UserProgress } from "@/types";

export function useProgress() {
  const [uid, setUid] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureAuth()
      .then(async (user) => {
        setUid(user.uid);
        let p = await getProgress(user.uid);
        if (!p) p = await initProgress(user.uid);
        setProgress(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completeLesson = async (lessonId: string, stars: number) => {
    if (!uid) return;
    await saveLessonProgress(uid, lessonId, stars);
    // Optimistic update
    setProgress((prev) => {
      if (!prev) return prev;
      const old = prev.lessonProgress[lessonId];
      const prevBest = old?.starsEarned ?? 0;
      const newBest = Math.max(prevBest, stars);
      return {
        ...prev,
        totalStars: prev.totalStars + Math.max(0, newBest - prevBest),
        lessonProgress: {
          ...prev.lessonProgress,
          [lessonId]: {
            lessonId,
            starsEarned: newBest,
            completedAt: new Date(),
            attempts: (old?.attempts ?? 0) + 1,
          },
        },
      };
    });
  };

  const getStarsForLesson = (lessonId: string): number =>
    progress?.lessonProgress[lessonId]?.starsEarned ?? 0;

  return {
    uid,
    progress,
    loading,
    completeLesson,
    getStarsForLesson,
    totalStars: progress?.totalStars ?? 0,
  };
}
