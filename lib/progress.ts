import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { db, auth } from "./firebase";
import type { UserProgress, LessonProgress } from "@/types";

// ── Auth ───────────────────────────────────────

/** Sign in anonymously (creates a persistent uid per device) */
export async function ensureAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

// ── Progress CRUD ──────────────────────────────

const progressRef = (uid: string) => doc(db, "kids_progress", uid);

export async function getProgress(uid: string): Promise<UserProgress | null> {
  const snap = await getDoc(progressRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProgress;
}

export async function initProgress(uid: string): Promise<UserProgress> {
  const data: UserProgress = {
    userId: uid,
    totalStars: 0,
    currentAgeGroup: "5-6",
    lessonProgress: {},
    lastActiveAt: new Date(),
  };
  await setDoc(progressRef(uid), data);
  return data;
}

export async function saveLessonProgress(
  uid: string,
  lessonId: string,
  starsEarned: number
): Promise<void> {
  const ref = progressRef(uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await initProgress(uid);
  }

  const existing = snap.data()?.lessonProgress?.[lessonId] as
    | LessonProgress
    | undefined;
  const previousBest = existing?.starsEarned ?? 0;
  const newBest = Math.max(previousBest, starsEarned);
  const starsDiff = newBest - previousBest; // only add net new stars

  const lessonEntry: LessonProgress = {
    lessonId,
    starsEarned: newBest,
    completedAt: new Date(),
    attempts: (existing?.attempts ?? 0) + 1,
  };

  await updateDoc(ref, {
    [`lessonProgress.${lessonId}`]: lessonEntry,
    totalStars: (snap.data()?.totalStars ?? 0) + (starsDiff > 0 ? starsDiff : 0),
    lastActiveAt: serverTimestamp(),
  });
}
