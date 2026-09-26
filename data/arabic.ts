import type { Subject, Lesson } from "@/types";

// ────────────────────────────────────────────────
//  Arabic Data
//  لإضافة درس جديد: أضف object في مصفوفة lessons
//  level: 1=سهل  2=متوسط  3=صعب
//  ageMin: الحد الأدنى للعمر
// ────────────────────────────────────────────────

const lessons: Lesson[] = [
  // ── Level 1 · Age 5-6 ───────────────────────
  {
    id: "ar-letters-group1",
    name: "الحروف أ ب ت ث ج",
    description: "الحروف الأولى مع صور",
    icon: "🔡",
    type: "flashcard",
    level: 1,
    ageMin: 5,
    data: [
      { emoji: "🍎", main: "أَ", sub: "أَسَد", color: "#FECACA", example: "الأَسَد ملكُ الغابة" },
      { emoji: "🏠", main: "بَ", sub: "بَيت",  color: "#BFDBFE", example: "البَيت كبير وجميل" },
      { emoji: "🍅", main: "تَ", sub: "تُفّاحة", color: "#FEF08A", example: "التُفّاحة حمراء" },
      { emoji: "🦊", main: "ثَ", sub: "ثَعلب", color: "#A7F3D0", example: "الثَعلب ذكي" },
      { emoji: "🐫", main: "جَ", sub: "جَمَل",  color: "#DDD6FE", example: "الجَمَل في الصحراء" },
    ],
  },
  {
    id: "ar-letters-group2",
    name: "الحروف ح خ د ذ ر",
    description: "تعلم المزيد من الحروف",
    icon: "🔡",
    type: "flashcard",
    level: 1,
    ageMin: 5,
    data: [
      { emoji: "🐎", main: "حِ", sub: "حِصان",  color: "#FECACA", example: "الحِصان يجري سريعاً" },
      { emoji: "🗡️", main: "خَ", sub: "خَروف", color: "#BFDBFE", example: "الخَروف أبيض اللون" },
      { emoji: "🐻", main: "دُ", sub: "دُبّ",   color: "#FEF08A", example: "الدُبّ يحبّ العسل" },
      { emoji: "🌽", main: "ذُ", sub: "ذُرة",   color: "#A7F3D0", example: "الذُرة طعامها لذيذ" },
      { emoji: "🏃", main: "رَ", sub: "رَمّان", color: "#DDD6FE", example: "الرَمّان أحمر اللون" },
    ],
  },
  {
    id: "ar-letters-group3",
    name: "الحروف ز س ش ص ض",
    description: "الحروف من ز إلى ض",
    icon: "🔡",
    type: "flashcard",
    level: 1,
    ageMin: 5,
    data: [
      { emoji: "🌸", main: "زَ", sub: "زَهرة",  color: "#FBCFE8", example: "الزَهرة جميلة وعطرة" },
      { emoji: "🐟", main: "سَ", sub: "سَمَكة", color: "#BFDBFE", example: "السَمَكة تسبح في البحر" },
      { emoji: "☀️", main: "شَ", sub: "شَمس",  color: "#FEF08A", example: "الشَمس تضيء النهار" },
      { emoji: "🦅", main: "صَ", sub: "صَقر",  color: "#A7F3D0", example: "الصَقر يطير عالياً" },
      { emoji: "🐸", main: "ضِ", sub: "ضِفدع", color: "#D1FAE5", example: "الضِفدع يقفز" },
    ],
  },
  {
    id: "ar-letters-group4",
    name: "الحروف ط ظ ع غ ف",
    description: "تعلم باقي الحروف",
    icon: "🔡",
    type: "flashcard",
    level: 1,
    ageMin: 5,
    data: [
      { emoji: "🥁", main: "طَ", sub: "طَبل",  color: "#FED7AA", example: "الطَبل يُصدر صوتاً" },
      { emoji: "🦌", main: "ظَ", sub: "ظَبي",  color: "#DDD6FE", example: "الظَبي رشيق" },
      { emoji: "🍇", main: "عِ", sub: "عِنَب", color: "#BFDBFE", example: "العِنَب حلو المذاق" },
      { emoji: "🌙", main: "غَ", sub: "غَيم",  color: "#E0F2FE", example: "الغَيم في السماء" },
      { emoji: "🐘", main: "فِ", sub: "فِيل",  color: "#FECACA", example: "الفِيل حيوان كبير" },
    ],
  },
  {
    id: "ar-letters-group5",
    name: "الحروف ق ك ل م ن هـ و ي",
    description: "آخر الحروف الهجائية",
    icon: "🔡",
    type: "flashcard",
    level: 1,
    ageMin: 5,
    data: [
      { emoji: "🐱", main: "قِ", sub: "قِطة",  color: "#FECACA", example: "القِطة تموء" },
      { emoji: "🐶", main: "كَ", sub: "كَلب",  color: "#BFDBFE", example: "الكَلب وفيّ" },
      { emoji: "🦁", main: "لِ", sub: "لِيمون", color: "#FEF08A", example: "الليمون حامض" },
      { emoji: "🐒", main: "مَ", sub: "مَوز",  color: "#A7F3D0", example: "المَوز فاكهة صفراء" },
      { emoji: "🐝", main: "نَ", sub: "نَحلة", color: "#FEF3C7", example: "النَحلة تصنع العسل" },
      { emoji: "🌙", main: "هِ", sub: "هِلال", color: "#DDD6FE", example: "الهِلال يظهر ليلاً" },
      { emoji: "🌹", main: "وَ", sub: "وَردة", color: "#FBCFE8", example: "الوَردة حمراء جميلة" },
      { emoji: "🤚", main: "يَ", sub: "يَد",   color: "#E0E7FF", example: "اليَد لها خمسة أصابع" },
    ],
  },

  // ── Level 1 · Quiz ───────────────────────────
  {
    id: "ar-quiz-letters-1",
    name: "اختبار: الحروف أ-ج",
    description: "اختبر معلوماتك",
    icon: "❓",
    type: "quiz",
    level: 1,
    ageMin: 5,
    data: [
      { question: "هذه الصورة 🍎 تبدأ بحرف؟", icon: "🍎", options: ["أ", "ب", "ت", "ث"], correctIndex: 0 },
      { question: "هذه الصورة 🏠 تبدأ بحرف؟", icon: "🏠", options: ["ب", "ج", "ح", "س"], correctIndex: 0 },
      { question: "هذه الصورة ☀️ تبدأ بحرف؟", icon: "☀️", options: ["س", "ز", "ش", "ص"], correctIndex: 2, explanation: "شَمس تبدأ بحرف الشين" },
      { question: "هذه الصورة 🐟 تبدأ بحرف؟", icon: "🐟", options: ["ث", "س", "ز", "ص"], correctIndex: 1, explanation: "سَمَكة تبدأ بحرف السين" },
      { question: "هذه الصورة 🌸 تبدأ بحرف؟", icon: "🌸", options: ["ر", "ز", "ذ", "ض"], correctIndex: 1 },
      { question: "هذه الصورة 🐫 تبدأ بحرف؟", icon: "🐫", options: ["ج", "ح", "خ", "د"], correctIndex: 0, explanation: "جَمَل تبدأ بحرف الجيم" },
    ],
  },
  {
    id: "ar-match-letters",
    name: "صِل الصورة بالحرف",
    description: "لعبة المطابقة",
    icon: "🔗",
    type: "match",
    level: 1,
    ageMin: 5,
    data: [
      { right: "🍎", left: "أ" },
      { right: "🏠", left: "ب" },
      { right: "☀️", left: "ش" },
      { right: "🐟", left: "س" },
      { right: "🌸", left: "ز" },
      { right: "🐫", left: "ج" },
    ],
  },

  // ── Level 2 · Age 7-8 ───────────────────────
  {
    id: "ar-words-animals",
    name: "كلمات: الحيوانات",
    description: "تعلم كلمات الحيوانات",
    icon: "🐾",
    type: "flashcard",
    level: 2,
    ageMin: 7,
    data: [
      { emoji: "🦁", main: "أَسَد",   sub: "ملك الغابة",      color: "#FEF3C7", example: "يعيش الأسد في الغابة" },
      { emoji: "🐘", main: "فِيل",    sub: "أكبر الحيوانات",   color: "#F3F4F6", example: "الفيل له خرطوم طويل" },
      { emoji: "🦒", main: "زَرافة",  sub: "لها رقبة طويلة",   color: "#FEF08A", example: "الزرافة أطول الحيوانات" },
      { emoji: "🐊", main: "تِمساح", sub: "يعيش في النيل",    color: "#A7F3D0", example: "التمساح حيوان مفترس" },
      { emoji: "🐬", main: "دُلفين",  sub: "يسبح في البحر",   color: "#BFDBFE", example: "الدلفين ذكي وودود" },
      { emoji: "🦅", main: "نَسر",    sub: "طائر قوي",         color: "#DDD6FE", example: "النسر يحلق عالياً" },
    ],
  },
  {
    id: "ar-words-food",
    name: "كلمات: الطعام والفواكه",
    description: "أسماء الأكل والفواكه",
    icon: "🍎",
    type: "flashcard",
    level: 2,
    ageMin: 7,
    data: [
      { emoji: "🍎", main: "تُفّاحة", sub: "فاكهة حمراء",    color: "#FECACA" },
      { emoji: "🍌", main: "مَوز",    sub: "فاكهة صفراء",    color: "#FEF08A" },
      { emoji: "🍊", main: "بُرتقال", sub: "فاكهة برتقالية", color: "#FED7AA" },
      { emoji: "🍇", main: "عِنَب",   sub: "فاكهة بنفسجية",  color: "#DDD6FE" },
      { emoji: "🥭", main: "مَانجو",  sub: "فاكهة استوائية", color: "#FEF3C7" },
      { emoji: "🍓", main: "فِراولة", sub: "فاكهة حمراء صغيرة", color: "#FBCFE8" },
      { emoji: "🍞", main: "خُبز",    sub: "طعام أساسي",     color: "#FEF3C7" },
      { emoji: "🍚", main: "أُرز",    sub: "طعام أساسي",     color: "#F3F4F6" },
    ],
  },
  {
    id: "ar-fill-sentences",
    name: "أكمل الجملة",
    description: "اختر الكلمة الصحيحة",
    icon: "✏️",
    type: "fill",
    level: 2,
    ageMin: 7,
    data: [
      { sentence: "الشَمس تُضيء في الـ___", answer: "نهار", hint: "عكس الليل", options: ["ليل", "نهار", "صباح", "مساء"] },
      { sentence: "الـ___ يسبح في البحر", answer: "سمك", hint: "حيوان مائي", options: ["طائر", "سمك", "أسد", "فيل"] },
      { sentence: "الأسد يعيش في الـ___", answer: "غابة", hint: "مكان فيه أشجار كتيرة", options: ["بحر", "غابة", "مدرسة", "بيت"] },
      { sentence: "النحلة تصنع الـ___", answer: "عسل", hint: "طعام حلو", options: ["خبز", "لبن", "عسل", "ماء"] },
      { sentence: "القمر يظهر في الـ___", answer: "ليل", hint: "عكس النهار", options: ["نهار", "صباح", "ليل", "ظهر"] },
    ],
  },

  // ── Level 3 · Age 9-12 ──────────────────────
  {
    id: "ar-sentences-reading",
    name: "قراءة الجمل القصيرة",
    description: "اقرأ وافهم الجملة",
    icon: "📖",
    type: "quiz",
    level: 3,
    ageMin: 9,
    data: [
      {
        question: "ما معنى كلمة «مُجتهِد»؟",
        icon: "📚",
        options: ["كسول", "يعمل بجد", "يلعب كثيراً", "نائم"],
        correctIndex: 1,
        explanation: "المجتهد هو الشخص الذي يعمل ويدرس بجد واجتهاد",
      },
      {
        question: "جمع كلمة «كِتاب» هي؟",
        icon: "📚",
        options: ["كُتّاب", "كِتابان", "كُتُب", "كِتابات"],
        correctIndex: 2,
        explanation: "جمع كِتاب = كُتُب",
      },
      {
        question: "ما المؤنث من كلمة «طالب»؟",
        icon: "🎓",
        options: ["طالبة", "طالبات", "مطلوب", "طلاب"],
        correctIndex: 0,
      },
      {
        question: "اختر الجملة الصحيحة نحوياً:",
        icon: "✏️",
        options: [
          "ذهبتُ إلى المدرسةَ",
          "ذهبتُ إلى المدرسةِ",
          "ذهبتُ إلى المدرسةً",
          "ذهبتُ إلى المدرسةُ",
        ],
        correctIndex: 1,
        explanation: "بعد حرف الجر «إلى» نستخدم الكسرة",
      },
    ],
  },
];

export const arabicSubject: Subject = {
  key: "arabic",
  name: "اللغة العربية",
  nameEn: "Arabic",
  subtitle: "الحروف، الكلمات، والجمل",
  icon: "📖",
  color: "from-red-500 to-orange-500",
  headerClass: "bg-gradient-to-br from-red-500 to-orange-500",
  lessons,
};
