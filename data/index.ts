import { arabicSubject }  from "./arabic";
import { englishSubject } from "./english";
import { mathSubject }    from "./math";
import { quranSubject }   from "./quran";
import type { Subject, SubjectKey } from "@/types";

export const subjects: Record<SubjectKey, Subject> = {
  arabic:  arabicSubject,
  english: englishSubject,
  math:    mathSubject,
  quran:   quranSubject,
};

export { arabicSubject, englishSubject, mathSubject, quranSubject };

/** Filter lessons by age and optional level */
export function getLessonsForAge(
  subject: Subject,
  age: number,
  level?: 1 | 2 | 3
) {
  return subject.lessons.filter(
    (l) => l.ageMin <= age && (level == null || l.level === level)
  );
}
