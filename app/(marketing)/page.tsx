import { ConsultingHero } from "@/components/homepage/consulting-hero";
import { WhatIBuild } from "@/components/homepage/what-i-build";
import { NewsletterTeaser } from "@/components/homepage/newsletter-teaser";
import { TrustStrip } from "@/components/landing/trust-strip";
import { About } from "@/components/landing/about";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lucas Senechal — AI Systems That Scale Revenue Without Scaling Headcount",
  description:
    "I build AI systems that eliminate repetitive admin and follow-ups so your team scales revenue without scaling headcount. Custom automation, process consulting, and ongoing management.",
  openGraph: {
    title: "Lucas Senechal — AI Systems That Scale Revenue Without Scaling Headcount",
    description:
      "I build AI systems that eliminate repetitive admin and follow-ups so your team scales revenue without scaling headcount.",
    url: "https://lucassenechal.com",
  },
};

export default function HomePage() {
  return (
    <main>
      <ConsultingHero />
      <WhatIBuild />
      <TrustStrip />
      <About />
      <NewsletterTeaser />
      <Footer />
    </main>
  );
}
