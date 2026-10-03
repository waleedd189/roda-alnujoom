# ⭐ روضة النجوم — Roda Al-Nujoom

تطبيق تعليمي تفاعلي للأطفال من 5 إلى 12 سنة، يغطي اللغة العربية والإنجليزية والرياضيات والقرآن الكريم.

## ✨ المميزات

- 📖 **عربي** — الحروف، الكلمات، الجمل، النحو
- 🔤 **English** — Alphabet, Colors, Family, Sentences, Grammar
- 🔢 **رياضيات** — أرقام، جمع، طرح، ضرب، كسور، أشكال هندسية
- 🌙 **قرآن وديني** — الفاتحة، الإخلاص، الفلق، الناس، الكوثر، العصر، الضحى، أدعية
- 🔊 **نطق واضح** — نظام صوت متدرّج: ملفات مسجلة → محرك TTS احترافي → صوت المتصفح
- 📿 **تلاوة بصوت قارئ حقيقي** — آية آية بصوت الحصري المعلّم (مش صوت آلي) مع وضع حفظ وتكرار
- 🌙 **وضع ليلي** + 🎵 مؤثرات صوتية + 🎊 احتفال بالنجوم
- ⭐ **نجوم وتقدم** — محفوظ محليًا على الجهاز الآن، مع إمكانية ربط Firebase لاحقًا
- 🎮 **5 أنواع ألعاب** — بطاقات، أسئلة، مطابقة، عد، أكمل الجملة
- 👶🧒 **4 مستويات عمرية** — 5-6 / 7-8 / 9-10 / 11-12 سنة
- 📱 **Responsive** — موبايل، تابلت، كمبيوتر

## 🔊 نظام الصوت (مهم)

### 1) القرآن — تلاوة بصوت قارئ حقيقي

القرآن **لا يُنطق أبدًا** بصوت آلي. كل آية مربوطة برقم سورة ورقم آية،
والتطبيق يشغّل ملف MP3 للتلاوة من CDN مجاني:

| المصدر | الاستخدام |
|---|---|
| `everyayah.com` | المصدر الأساسي |
| `cdn.islamic.network` | مصدر احتياطي لو الأول فشل |

القارئ الافتراضي: **محمود خليل الحصري (المعلّم)** — ترتيل بطيء وواضح مخصص لتعليم الأطفال.
وتقدر تغيّره من ⚙️ الإعدادات (العفاسي، المنشاوي، عبد الباسط، السديس…).

**مشغّل القرآن** (`components/QuranPlayer.tsx`) فيه:
- تشغيل الآية مع تكرار (×1 / ×2 / ×3 / ×5) وسكتة بينهم عشان الطفل يردد
- تشغيل متتابع للسورة كاملة مع تحميل مسبق للآية الجاية
- **وضع الحفظ** — إخفاء النص والاعتماد على السمع
- عرض المعنى المبسّط بالعامية

> ⚠️ أي سورة جديدة لازم تضيف لها `surah` و `ayah` في `data/quran.ts`،
> وتتأكد إن السورة موجودة في جدول `SURAHS` داخل `lib/quranAudio.ts`.

### 2) الحروف والكلمات — TTS احترافي

صوت المتصفح (Web Speech) ضعيف جدًا في العربي، فالتطبيق بيجرب بالترتيب:

1. **ملف صوت مسجّل** — لو حطيت `audio: "/audio/alef.mp3"` في بيانات البطاقة
2. **`/api/tts`** — محرك احترافي حسب المفتاح الموجود في `.env.local`
3. **Web Speech API** — حل أخير مع اختيار أفضل صوت عربي متاح

ضيف مفتاح واحد بس في `.env.local` والتطبيق هيكتشفه لوحده:

```bash
# الأحسن للعربي من حيث الجودة/السعر
GOOGLE_TTS_API_KEY=xxxx
# أو أصوات مصرية ممتازة
AZURE_SPEECH_KEY=xxxx
AZURE_SPEECH_REGION=westeurope
# أو
ELEVENLABS_API_KEY=xxxx
# أو
OPENAI_API_KEY=xxxx
```

النتيجة بتتكاش على السيرفر + في المتصفح، فمش هتستهلك الـ API كل مرة.
من غير أي مفتاح التطبيق بيشتغل عادي بصوت المتصفح.

### 3) تصحيح نطق الحروف

`lib/arabicText.ts` بيصلّح النص قبل ما يروح لأي محرك:

| المكتوب | اللي بيتنطق |
|---|---|
| `بَ` | «بَاء . بَا» (اسم الحرف ثم صوته) |
| `حِ` | «حَاء . حِي» |
| `دُ` | «دَال . دُو» |
| `ش` | «شِين» |
| `محمد ﷺ` | «محمد صلى الله عليه وسلم» |

## 🚀 تشغيل المشروع

```bash
# 1. نسخ المشروع
git clone https://github.com/YOUR_USERNAME/roda-alnujoom.git
cd roda-alnujoom

# 2. تثبيت الحزم
npm install

# 3. تشغيل السيرفر
npm run dev

# Firebase اختياري حاليًا — التقدم محفوظ محليًا في المتصفح
# لو حبيت تربطه لاحقًا:
# cp .env.local.example .env.local
# وعدّل .env.local وأضف بيانات Firebase بتاعتك
```

ثم افتح: [http://localhost:3000](http://localhost:3000)

## 🔥 إعداد Firebase (اختياري لاحقًا)

التطبيق حاليًا يشتغل بنظام حفظ محلي `localStorage` بدون إعداد Firebase. لو احتجت مزامنة التقدم بين الأجهزة أو حسابات للأطفال، اتبع الخطوات التالية:

1. روح [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد
3. فعّل **Authentication → Anonymous** (تسجيل دخول مجهول)
4. أنشئ **Firestore Database**
5. أضف هذا الـ Security Rule في Firestore:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /kids_progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. انسخ بيانات المشروع في `.env.local`

## 📁 هيكل المشروع

```
roda-alnujoom/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # الرئيسية (اختيار المادة والعمر)
│   ├── globals.css
│   └── [subject]/
│       ├── page.tsx            # قائمة الدروس
│       └── [lesson]/
│           └── page.tsx        # الدرس نفسه
│
├── components/
│   ├── FlashCard.tsx           # بطاقات تعليمية مع صوت
│   ├── Quiz.tsx                # أسئلة اختيار من متعدد
│   ├── MatchGame.tsx           # لعبة المطابقة
│   ├── CountGame.tsx           # لعبة العد
│   ├── FillGame.tsx            # أكمل الجملة
│   ├── QuranPlayer.tsx         # مشغّل التلاوة (قارئ حقيقي + وضع حفظ)
│   ├── SettingsSheet.tsx       # الإعدادات (صوت/قارئ/وضع ليلي)
│   ├── Confetti.tsx            # احتفال نهاية الدرس
│   ├── SpeakButton.tsx         # زر النطق (TTS)
│   ├── ProgressBar.tsx         # شريط التقدم
│   └── StarDisplay.tsx         # عرض النجوم
│
├── data/
│   ├── index.ts                # Export مركزي
│   ├── arabic.ts               ← أضف دروس عربي هنا
│   ├── english.ts              ← أضف دروس إنجليزي هنا
│   ├── math.ts                 ← أضف دروس رياضيات هنا
│   └── quran.ts                ← أضف سور وأدعية هنا
│
├── lib/
│   ├── firebase.ts             # Firebase init
│   ├── progress.ts             # Firestore read/write
│   ├── speech.ts               # محرك النطق المتدرّج
│   ├── ttsProvider.ts          # اكتشاف مزوّد TTS من البيئة
│   ├── arabicText.ts           # تصحيح نطق الحروف العربية
│   ├── quranAudio.ts           # روابط تلاوة القرآن + القرّاء
│   ├── audioPlayer.ts          # مشغّل صوت موحّد
│   ├── sfx.ts                  # مؤثرات صوتية (Web Audio)
│   └── settings.ts             # إعدادات المستخدم
│
├── hooks/
│   ├── useProgress.ts          # Progress hook
│   ├── useSettings.ts          # Settings hook
│   └── useSpeech.ts            # Speech hook
│
└── types/
    └── index.ts                # كل الـ TypeScript types
```

## ➕ إضافة سورة جديدة

افتح `data/quran.ts` وأضف object جديد في مصفوفة `lessons`:

```ts
{
  id: "qr-naba",            // ID فريد
  name: "سورة النبأ",
  description: "عم يتساءلون — ٤٠ آية",
  icon: "📿",
  type: "flashcard",
  level: 2,                 // 1=سهل  2=متوسط  3=صعب
  ageMin: 7,                // الحد الأدنى للعمر
  data: [
    // ❗ surah + ayah مطلوبين عشان تشتغل التلاوة بصوت القارئ
    { emoji: "🌟", surah: 78, ayah: 1, main: "عَمَّ يَتَسَاءَلُونَ", sub: "عن ماذا يتساءلون", color: "#EDE9FE" },
    // ... باقي الآيات
  ],
},
```

## ➕ إضافة درس جديد بأي نوع

```ts
// Quiz
{
  id: "ar-quiz-new",
  name: "اختبار جديد",
  type: "quiz",
  level: 1,
  ageMin: 6,
  data: [
    {
      question: "السؤال هنا",
      icon: "❓",
      options: ["إجابة أ", "إجابة ب", "إجابة ج", "إجابة د"],
      correctIndex: 0,
      explanation: "شرح الإجابة الصحيحة",
    },
  ],
}

// Match
{
  id: "ar-match-new",
  type: "match",
  data: [
    { right: "🍎", left: "تفاحة" },
    { right: "🌸", left: "زهرة" },
  ],
}
```

## 🚀 رفع على Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# رفع المشروع
vercel

# أضف متغيرات البيئة في لوحة تحكم Vercel:
# Project Settings → Environment Variables
# وأضف نفس قيم .env.local
```

## 📦 رفع على GitHub

```bash
git init
git add .
git commit -m "🎉 first commit — روضة النجوم"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/roda-alnujoom.git
git push -u origin main
```

## 🛠️ Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Firebase Firestore |
| Auth | Firebase Anonymous Auth |
| Speech | Google / Azure / ElevenLabs / OpenAI TTS + Web Speech fallback |
| Quran Audio | everyayah.com + cdn.islamic.network (قرّاء حقيقيون) |
| Fonts | Google Fonts — Tajawal + Amiri Quran |
| Deploy | Vercel |

---

صُنع بحب لأطفالنا 💜
