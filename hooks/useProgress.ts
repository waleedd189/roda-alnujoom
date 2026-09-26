"use client";

import { useCallback, useEffect, useState } from "react";
import type { AgeGroup, LessonProgress, UserProgress } from "@/types";

const STORAGE_KEY = "roda_alnujoom_progress_v1";
const DEVICE_ID_KEY = "roda_alnujoom_child_id";
const DEFAULT_AGE_GROUP: AgeGroup = "5-6";

const AGE_GROUPS: AgeGroup[] = ["5-6", "7-8", "9-10", "11-12"];

type SerializableLessonProgress = Omit<LessonProgress, "completedAt"> & {
  completedAt: string | Date;
};

type SerializableUserProgress = Omit<UserProgress, "lastActiveAt" | "lessonProgress"> & {
  lastActiveAt: string | Date;
  lessonProgress: Record<string, SerializableLessonProgress>;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function isAgeGroup(value: unknown): value is AgeGroup {
  return typeof value === "string" && AGE_GROUPS.includes(value as AgeGroup);
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function createDeviceId(): string {
  if (isBrowser() && window.crypto?.randomUUID) {
    return `local-${window.crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateDeviceId(): string {
  if (!isBrowser()) return "local-preview";

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;

    const next = createDeviceId();
    window.localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return createDeviceId();
  }
}

function createInitialProgress(userId: string, ageGroup: AgeGroup = DEFAULT_AGE_GROUP): UserProgress {
  return {
    userId,
    totalStars: 0,
    currentAgeGroup: ageGroup,
    lessonProgress: {},
    lastActiveAt: new Date(),
  };
}

function normalizeProgress(raw: Partial<SerializableUserProgress> | null, userId: string): UserProgress {
  if (!raw) return createInitialProgress(userId);

  const lessonProgress = Object.entries(raw.lessonProgress ?? {}).reduce<Record<string, LessonProgress>>(
    (acc, [lessonId, entry]) => {
      if (!entry) return acc;

      const starsEarned = Math.max(0, Math.min(3, Number(entry.starsEarned) || 0));
      acc[lessonId] = {
        lessonId: entry.lessonId || lessonId,
        starsEarned,
        completedAt: toDate(entry.completedAt),
        attempts: Math.max(1, Number(entry.attempts) || 1),
      };
      return acc;
    },
    {}
  );

  const totalStars = Object.values(lessonProgress).reduce(
    (sum, entry) => sum + Math.max(0, Math.min(3, entry.starsEarned)),
    0
  );

  return {
    userId: typeof raw.userId === "string" ? raw.userId : userId,
    totalStars,
    currentAgeGroup: isAgeGroup(raw.currentAgeGroup) ? raw.currentAgeGroup : DEFAULT_AGE_GROUP,
    lessonProgress,
    lastActiveAt: toDate(raw.lastActiveAt),
  };
}

function loadLocalProgress(userId: string): UserProgress {
  if (!isBrowser()) return createInitialProgress(userId);

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialProgress(userId);
    return normalizeProgress(JSON.parse(saved) as Partial<SerializableUserProgress>, userId);
  } catch {
    return createInitialProgress(userId);
  }
}

function saveLocalProgress(progress: UserProgress): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // بعض المتصفحات تمنع localStorage في وضع الخصوصية؛ التطبيق يفضل شغال بدون حفظ.
  }
}

function clampStars(stars: number): number {
  return Math.max(0, Math.min(3, Math.round(stars)));
}

function withCompletedLesson(progress: UserProgress, lessonId: string, stars: number): UserProgress {
  const old = progress.lessonProgress[lessonId];
  const previousBest = old?.starsEarned ?? 0;
  const newBest = Math.max(previousBest, clampStars(stars));

  const lessonEntry: LessonProgress = {
    lessonId,
    starsEarned: newBest,
    completedAt: new Date(),
    attempts: (old?.attempts ?? 0) + 1,
  };

  const lessonProgress = {
    ...progress.lessonProgress,
    [lessonId]: lessonEntry,
  };

  const totalStars = Object.values(lessonProgress).reduce(
    (sum, entry) => sum + Math.max(0, Math.min(3, entry.starsEarned)),
    0
  );

  return {
    ...progress,
    totalStars,
    lessonProgress,
    lastActiveAt: new Date(),
  };
}

export function useProgress() {
  const [uid, setUid] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    const storedProgress = loadLocalProgress(id);

    setUid(id);
    setProgress(storedProgress);
    setLoading(false);
  }, []);

  const completeLesson = useCallback(
    async (lessonId: string, stars: number) => {
      const id = uid ?? getOrCreateDeviceId();
      if (!uid) setUid(id);

      setProgress((prev) => {
        const base = prev ?? loadLocalProgress(id);
        const next = withCompletedLesson(base, lessonId, stars);
        saveLocalProgress(next);
        return next;
      });
    },
    [uid]
  );

  const setCurrentAgeGroup = useCallback((ageGroup: AgeGroup) => {
    setProgress((prev) => {
      const id = prev?.userId ?? getOrCreateDeviceId();
      const next: UserProgress = {
        ...(prev ?? createInitialProgress(id, ageGroup)),
        currentAgeGroup: ageGroup,
        lastActiveAt: new Date(),
      };
      saveLocalProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const id = getOrCreateDeviceId();
    const next = createInitialProgress(id, progress?.currentAgeGroup ?? DEFAULT_AGE_GROUP);
    saveLocalProgress(next);
    setUid(id);
    setProgress(next);
  }, [progress?.currentAgeGroup]);

  const getStarsForLesson = useCallback(
    (lessonId: string): number => progress?.lessonProgress[lessonId]?.starsEarned ?? 0,
    [progress]
  );

  return {
    uid,
    progress,
    loading,
    completeLesson,
    getStarsForLesson,
    setCurrentAgeGroup,
    resetProgress,
    currentAgeGroup: progress?.currentAgeGroup ?? DEFAULT_AGE_GROUP,
    totalStars: progress?.totalStars ?? 0,
    storageMode: "local" as const,
  };
}
