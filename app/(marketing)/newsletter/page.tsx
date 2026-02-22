import { HeroSection } from "@/components/landing/hero";
import { ExampleCards } from "@/components/landing/example-cards";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TrustStrip } from "@/components/landing/trust-strip";
import { About } from "@/components/landing/about";
import { Footer } from "@/components/landing/footer";
import { StickyCTA } from "@/components/landing/sticky-cta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Daily Briefing | Lucas Senechal",
  description:
    "Your daily edge, researched by AI. A personalized newsletter tailored to exactly what you care about.",
  openGraph: {
    title: "The Daily Briefing | Lucas Senechal",
    description:
      "Your daily edge, researched by AI. A personalized newsletter tailored to exactly what you care about.",
    url: "https://lucassenechal.com/newsletter",
  },
};

export default function NewsletterPage() {
  return (
    <main>
      <HeroSection />
      <TrustStrip />
      <ExampleCards />
      <HowItWorks />
      <About />
      <Footer />
      <StickyCTA />
    </main>
  );
}
