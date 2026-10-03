// ────────────────────────────────────────────────
//  Arabic Text → Speech-ready Text
//  المشكلة: محركات النطق بتنطق الحرف المفرد غلط
//  (مثلاً "بَ" بتتقري "باء" أو تتجاهل تمامًا)
//  الحل: نحوّل النص لصيغة ينطقها المحرك صح.
// ────────────────────────────────────────────────

/** أسماء الحروف العربية منطوقة */
export const ARABIC_LETTER_NAMES: Record<string, string> = {
  "ا": "أَلِف",
  "أ": "أَلِف",
  "إ": "أَلِف",
  "آ": "أَلِف مَدّ",
  "ب": "بَاء",
  "ت": "تَاء",
  "ث": "ثَاء",
  "ج": "جِيم",
  "ح": "حَاء",
  "خ": "خَاء",
  "د": "دَال",
  "ذ": "ذَال",
  "ر": "رَاء",
  "ز": "زَاي",
  "س": "سِين",
  "ش": "شِين",
  "ص": "صَاد",
  "ض": "ضَاد",
  "ط": "طَاء",
  "ظ": "ظَاء",
  "ع": "عَين",
  "غ": "غَين",
  "ف": "فَاء",
  "ق": "قَاف",
  "ك": "كَاف",
  "ل": "لَام",
  "م": "مِيم",
  "ن": "نُون",
  "ه": "هَاء",
  "هـ": "هَاء",
  "و": "وَاو",
  "ي": "يَاء",
  "ى": "أَلِف مَقصُورة",
  "ة": "تَاء مَربُوطة",
  "ء": "هَمزة",
  "ئ": "هَمزة",
  "ؤ": "هَمزة",
  "لا": "لَام أَلِف",
};

const FATHA = "\u064E";
const DAMMA = "\u064F";
const KASRA = "\u0650";
const SUKUN = "\u0652";
const SHADDA = "\u0651";
const TATWEEL = "\u0640";

const HARAKAT = /[\u064B-\u0652\u0670]/g;

/** علامات ورموز شائعة لازم تتقري بشكل صحيح */
const SYMBOL_MAP: Array<[RegExp, string]> = [
  [/ﷺ/g, " صَلَّى اللهُ عَلَيهِ وَسَلَّم "],
  [/ﷻ/g, " جَلَّ جَلالُه "],
  [/﷽/g, " بِسمِ اللهِ الرَّحمَنِ الرَّحِيم "],
  [/عليه السلام/g, "عَلَيهِ السَّلام"],
  [/\.{3,}/g, "، "],
  [/_{2,}/g, " ... "],
  [/[«»"'"]/g, " "],
  [/\s+/g, " "],
];

/** إزالة التطويل والمسافات الزائدة */
export function cleanArabic(text: string): string {
  let out = text.replace(new RegExp(TATWEEL, "g"), "");
  for (const [pattern, replacement] of SYMBOL_MAP) {
    out = out.replace(pattern, replacement);
  }
  return out.trim();
}

/** النص ده حرف واحد (مع أو بدون حركة)؟ */
export function isSingleLetter(text: string): boolean {
  const bare = cleanArabic(text).replace(HARAKAT, "").replace(/\s/g, "");
  return bare.length === 1 && /[\u0621-\u064A]/.test(bare);
}

/**
 * الحرف + حركته → مقطع صوتي ينطقه المحرك صح.
 *   بَ → بَا   |   بِ → بِي   |   بُ → بُو
 * الفكرة: المحركات بتنطق الحرف المفرد باسمه، لكن لما
 * يبقى مقطع كامل بتنطقه زي ما الطفل محتاج يسمعه بالظبط.
 */
export function letterToSyllable(text: string): string | null {
  const clean = cleanArabic(text).replace(/\s/g, "");
  const bare = clean.replace(HARAKAT, "");
  if (bare.length !== 1) return null;

  const letter = bare;
  if (!/[\u0621-\u064A]/.test(letter)) return null;

  // الهمزات بشكلها المكتوب ممكن تلخبط المحرك
  const base = letter === "أ" || letter === "إ" || letter === "آ" ? "ا" : letter;

  if (clean.includes(FATHA)) return base === "ا" ? "أَا" : base + FATHA + "ا";
  if (clean.includes(KASRA)) return base === "ا" ? "إِي" : base + KASRA + "ي";
  if (clean.includes(DAMMA)) return base === "ا" ? "أُو" : base + DAMMA + "و";
  if (clean.includes(SUKUN)) return ARABIC_LETTER_NAMES[letter] ?? letter;

  // حرف من غير حركة → ننطق اسمه
  return ARABIC_LETTER_NAMES[letter] ?? letter;
}

/** اسم الحرف منطوقًا (أ → أَلِف) */
export function letterName(letter: string): string {
  const bare = cleanArabic(letter).replace(HARAKAT, "").replace(/\s/g, "");
  return ARABIC_LETTER_NAMES[bare] ?? bare;
}

/**
 * نص جاهز للنطق:
 * - حرف مفرد  → "بَاء ... بَا"  (الاسم ثم الصوت)
 * - كلمة/جملة → تنضيف وتصحيح الرموز
 */
export function toSpeechText(text: string, opts?: { letterNameFirst?: boolean }): string {
  const clean = cleanArabic(text);
  if (!clean) return "";

  if (isSingleLetter(clean)) {
    const syllable = letterToSyllable(clean);
    const name = letterName(clean);
    if (!syllable) return name;
    if (syllable === name) return name;
    return opts?.letterNameFirst === false ? syllable : `${name} . ${syllable}`;
  }

  return clean;
}

/** في نص عربي؟ */
export function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/** في آيات قرآن؟ (نستخدمها للتأكد إننا منستخدمش صوت آلي للقرآن) */
export function looksLikeQuran(text: string): boolean {
  return /[\u0670\u06E5\u06E6\u08F0-\u08F3]/.test(text) || /ٱ/.test(text);
}

export { FATHA, DAMMA, KASRA, SUKUN, SHADDA, HARAKAT };
