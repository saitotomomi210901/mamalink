import type { Metadata } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const notoLines = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MamaLink | 「孤育て」をなくすママのセーフティネット",
  description: "近所のママ同士で助け合い、育児をもっと楽しく安全に。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={`${notoLines.variable} ${inter.variable} font-sans antialiased bg-background text-text`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
