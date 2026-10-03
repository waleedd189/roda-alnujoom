import type { Metadata, Viewport } from "next";
import "./globals.css";
import SettingsSheet from "@/components/SettingsSheet";
import AudioUnlock from "@/components/AudioUnlock";

export const metadata: Metadata = {
  title: "روضة النجوم — تعلم مع الفرح",
  description: "تطبيق تعليمي تفاعلي للأطفال — عربي وإنجليزي ورياضيات وقرآن بصوت واضح وتلاوة بصوت قارئ حقيقي",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/star.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

/** يمنع "وميض" الوضع النهاري قبل تحميل الإعدادات */
const THEME_SCRIPT = `
(function(){
  try {
    var raw = localStorage.getItem("roda_settings_v1");
    var theme = raw ? (JSON.parse(raw).theme || "light") : "light";
    if (theme === "dark") document.documentElement.classList.add("dark");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Amiri+Quran&display=swap"
          rel="stylesheet"
        />
        {/* تلاوة القرآن بتتحمّل من الشبكات دي */}
        <link rel="preconnect" href="https://everyayah.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.islamic.network" />
      </head>
      <body className="font-tajawal min-h-screen bg-[#FFF9F0] text-gray-800 antialiased dark:bg-slate-950 dark:text-gray-100">
        {children}
        <AudioUnlock />
        <SettingsSheet />
      </body>
    </html>
  );
}
