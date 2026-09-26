import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "روضة النجوم — تعلم مع الفرح",
  description: "تطبيق تعليمي للأطفال — عربي وإنجليزي ورياضيات وقرآن",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="theme-color" content="#7C3AED" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${tajawal.variable} font-tajawal bg-[#FFF9F0] text-gray-800 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
