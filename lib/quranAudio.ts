// ────────────────────────────────────────────────
//  تلاوة القرآن بصوت قارئ حقيقي
//  ❗ ممنوع نهائيًا استخدام الصوت الآلي (TTS) مع القرآن.
//  بنشغّل ملفات MP3 لكل آية من CDN مجاني ومفتوح.
//  المصدر الأساسي: everyayah.com
//  المصدر الاحتياطي: cdn.islamic.network
// ────────────────────────────────────────────────

export type ReciterId =
  | "husary_muallim"
  | "husary"
  | "alafasy"
  | "minshawi_muallim"
  | "abdulbasit"
  | "sudais";

export interface Reciter {
  id: ReciterId;
  name: string;
  note: string;
  /** مجلد everyayah */
  everyayah: string;
  /** إصدار cdn.islamic.network (احتياطي) */
  islamicNetwork: string;
  /** مناسب للأطفال والحفظ */
  forKids?: boolean;
}

export const RECITERS: Reciter[] = [
  {
    id: "husary_muallim",
    name: "محمود خليل الحصري (المعلّم)",
    note: "ترتيل بطيء وواضح — الأفضل لتعليم الأطفال الحفظ",
    everyayah: "Husary_Muallim_128kbps",
    islamicNetwork: "ar.husary",
    forKids: true,
  },
  {
    id: "minshawi_muallim",
    name: "محمد صديق المنشاوي (المعلّم)",
    note: "تلاوة تعليمية كلاسيكية مع الترديد",
    everyayah: "Minshawy_Mujawwad_192kbps",
    islamicNetwork: "ar.minshawi",
    forKids: true,
  },
  {
    id: "alafasy",
    name: "مشاري راشد العفاسي",
    note: "صوت واضح ومحبب للأطفال",
    everyayah: "Alafasy_128kbps",
    islamicNetwork: "ar.alafasy",
  },
  {
    id: "husary",
    name: "محمود خليل الحصري (مرتل)",
    note: "ترتيل مرتّل بالسرعة العادية",
    everyayah: "Husary_128kbps",
    islamicNetwork: "ar.husary",
  },
  {
    id: "abdulbasit",
    name: "عبد الباسط عبد الصمد",
    note: "مرتّل — صوت خاشع",
    everyayah: "Abdul_Basit_Murattal_64kbps",
    islamicNetwork: "ar.abdulbasitmurattal",
  },
  {
    id: "sudais",
    name: "عبد الرحمن السديس",
    note: "إمام الحرم المكي",
    everyayah: "Abdurrahmaan_As-Sudais_192kbps",
    islamicNetwork: "ar.abdurrahmaansudais",
  },
];

export const DEFAULT_RECITER: ReciterId = "husary_muallim";

export function getReciter(id: ReciterId | string | undefined): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0]!;
}

// ── معلومات السور المستخدمة في التطبيق ──────────
export interface SurahMeta {
  number: number;
  name: string;
  ayahCount: number;
  /** رقم أول آية في الترقيم العام للمصحف (1 - 6236) */
  globalStart: number;
}

export const SURAHS: Record<number, SurahMeta> = {
  1: { number: 1, name: "الفاتحة", ayahCount: 7, globalStart: 1 },
  93: { number: 93, name: "الضحى", ayahCount: 11, globalStart: 6080 },
  94: { number: 94, name: "الشرح", ayahCount: 8, globalStart: 6091 },
  103: { number: 103, name: "العصر", ayahCount: 3, globalStart: 6177 },
  108: { number: 108, name: "الكوثر", ayahCount: 3, globalStart: 6205 },
  110: { number: 110, name: "النصر", ayahCount: 3, globalStart: 6214 },
  112: { number: 112, name: "الإخلاص", ayahCount: 4, globalStart: 6222 },
  113: { number: 113, name: "الفلق", ayahCount: 5, globalStart: 6226 },
  114: { number: 114, name: "الناس", ayahCount: 6, globalStart: 6231 },
};

const pad3 = (n: number) => String(n).padStart(3, "0");

/** الرابط الأساسي — everyayah.com */
export function ayahAudioUrl(surah: number, ayah: number, reciterId: ReciterId = DEFAULT_RECITER): string {
  const reciter = getReciter(reciterId);
  return `https://everyayah.com/data/${reciter.everyayah}/${pad3(surah)}${pad3(ayah)}.mp3`;
}

/** رابط احتياطي — cdn.islamic.network (ترقيم عام) */
export function ayahAudioFallbackUrl(
  surah: number,
  ayah: number,
  reciterId: ReciterId = DEFAULT_RECITER
): string | null {
  const meta = SURAHS[surah];
  if (!meta) return null;
  const reciter = getReciter(reciterId);
  const globalAyah = meta.globalStart + ayah - 1;
  return `https://cdn.islamic.network/quran/audio/128/${reciter.islamicNetwork}/${globalAyah}.mp3`;
}

/** كل الروابط بالترتيب (الأساسي ثم الاحتياطي) */
export function ayahAudioSources(surah: number, ayah: number, reciterId: ReciterId = DEFAULT_RECITER): string[] {
  return [ayahAudioUrl(surah, ayah, reciterId), ayahAudioFallbackUrl(surah, ayah, reciterId)].filter(
    (u): u is string => Boolean(u)
  );
}

/** تحميل مسبق للآية الجاية عشان التشغيل يبقى فوري */
export function preloadAyah(surah: number, ayah: number, reciterId: ReciterId = DEFAULT_RECITER): void {
  if (typeof window === "undefined") return;
  const url = ayahAudioUrl(surah, ayah, reciterId);
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = url;
  // متشغّلش — بس خلي المتصفح يحمّله في الكاش
  audio.load();
}
