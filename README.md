# ⭐ روضة النجوم — Roda Al-Nujoom

تطبيق تعليمي تفاعلي للأطفال من 5 إلى 12 سنة، يغطي اللغة العربية والإنجليزية والرياضيات والقرآن الكريم.

## ✨ المميزات

- 📖 **عربي** — الحروف، الكلمات، الجمل، النحو
- 🔤 **English** — Alphabet, Colors, Family, Sentences, Grammar
- 🔢 **رياضيات** — أرقام، جمع، طرح، ضرب، كسور، أشكال هندسية
- 🌙 **قرآن وديني** — الفاتحة، الإخلاص، الفلق، الناس، الكوثر، العصر، الضحى، أدعية
- 🔊 **صوت ونطق** — Web Speech API (TTS) بالعربي والإنجليزي
- ⭐ **نجوم وتقدم** — محفوظ في Firebase لكل جهاز
- 🎮 **5 أنواع ألعاب** — بطاقات، أسئلة، مطابقة، عد، أكمل الجملة
- 👶🧒 **4 مستويات عمرية** — 5-6 / 7-8 / 9-10 / 11-12 سنة
- 📱 **Responsive** — موبايل، تابلت، كمبيوتر

## 🚀 تشغيل المشروع

```bash
# 1. نسخ المشروع
git clone https://github.com/YOUR_USERNAME/roda-alnujoom.git
cd roda-alnujoom

# 2. تثبيت الحزم
npm install

# 3. إعداد Firebase
cp .env.local.example .env.local
# عدّل .env.local وأضف بيانات Firebase بتاعتك

# 4. تشغيل السيرفر
npm run dev
```

ثم افتح: [http://localhost:3000](http://localhost:3000)

## 🔥 إعداد Firebase

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
│   └── speech.ts               # Web Speech API
│
├── hooks/
│   ├── useProgress.ts          # Progress hook
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
    { emoji: "🌟", main: "عَمَّ يَتَسَاءَلُونَ", sub: "عن ماذا يتساءلون", color: "#EDE9FE" },
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
| Speech | Web Speech API (TTS) |
| Fonts | Google Fonts — Tajawal |
| Deploy | Vercel |

---

صُنع بحب لأطفالنا 💜
