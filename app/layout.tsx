import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "روضة النجوم — تعلم مع الفرح",
  description: "تطبيق تعليمي تفاعلي للأطفال — عربي وإنجليزي ورياضيات وقرآن",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-tajawal bg-[#FFF9F0] text-gray-800 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
