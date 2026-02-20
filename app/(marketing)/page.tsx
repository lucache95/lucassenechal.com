import { HeroSection } from "@/components/landing/hero";
import { ExampleCards } from "@/components/landing/example-cards";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TrustStrip } from "@/components/landing/trust-strip";
import { About } from "@/components/landing/about";
import { Footer } from "@/components/landing/footer";
import { StickyCTA } from "@/components/landing/sticky-cta";

export default function MarketingPage() {
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
