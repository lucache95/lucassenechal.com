import type { Metadata } from "next";
import { Footer } from "@/components/landing/footer";
import { WorkWithMeCard } from "./work-with-me-card";

export const metadata: Metadata = {
  title: "Work With Me | Lucas Senechal",
  description:
    "AI systems consulting -- automation, process optimization, and ongoing management. Let's talk about what AI can do for your business.",
  openGraph: {
    title: "Work With Me | Lucas Senechal",
    description:
      "AI systems consulting -- automation, process optimization, and ongoing management. Let's talk about what AI can do for your business.",
    url: "https://lucassenechal.com/work-with-me",
    siteName: "Lucas Senechal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work With Me | Lucas Senechal",
    description:
      "AI systems consulting -- automation, process optimization, and ongoing management. Let's talk about what AI can do for your business.",
  },
};

export default function WorkWithMePage() {
  return (
    <>
      <section className="min-h-[60vh] flex items-center justify-center px-4">
        <WorkWithMeCard />
      </section>
      <Footer />
    </>
  );
}
