import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TwinPulse — AI Matching",
  description:
    "TwinPulseのAIエージェントが、あなたの価値観や性格を深く理解し、最適なマッチングを実現します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* PC Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className="min-h-screen lg:pl-[260px] pb-20 lg:pb-0">
          <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </body>
    </html>
  );
}
