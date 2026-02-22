import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customize Your Briefing | Lucas Senechal",
  description:
    "Personalize your daily briefing. Choose topics, format, delivery time, and more.",
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {children}
      </div>
    </div>
  );
}
