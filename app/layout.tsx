import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "Lucas Senechal — AI Systems That Scale Revenue Without Scaling Headcount",
  description:
    "I build AI systems that eliminate repetitive admin and follow-ups so teams scale revenue without scaling headcount. Consulting, automation, and ongoing management.",
  openGraph: {
    title: "Lucas Senechal — AI Systems Consulting",
    description:
      "AI automation, process consulting, and ongoing management. I build systems that do your busywork so you can focus on growth.",
    url: "https://lucassenechal.com",
    siteName: "Lucas Senechal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lucas Senechal — AI Systems Consulting",
    description:
      "I build AI systems that eliminate repetitive admin and follow-ups so teams scale revenue without scaling headcount.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-ZR3S9N3827"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ZR3S9N3827');
        `}
      </Script>
      <body className="antialiased">{children}</body>
    </html>
  );
}
