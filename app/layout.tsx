import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lucas Senechal — Your Daily Edge",
  description:
    "A personalized AI newsletter that researches and writes a daily briefing just for you. Not a generic blast — content tailored to exactly what you asked for.",
  openGraph: {
    title: "Lucas Senechal — Your Daily Edge",
    description:
      "Every morning, get a briefing researched and written just for you. Powered by AI. Sourced from real sites. Links included.",
    url: "https://lucassenechal.com",
    siteName: "Lucas Senechal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lucas Senechal — Your Daily Edge",
    description:
      "A personalized AI newsletter that researches and writes a daily briefing just for you.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
