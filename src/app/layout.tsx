import type { Metadata } from "next";
import "./globals.css";
import { AppLayoutWrapper } from "@/components/layout/app-layout-wrapper";

export const metadata: Metadata = {
  title: "BIST Productions - מערכת תפעול והפקות",
  description: "מערכת תפעול סטודיו, הצעות מחיר חכמות וניהול תוצרים מול לקוחות",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950 min-h-screen">
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
