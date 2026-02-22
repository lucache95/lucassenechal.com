import type { Metadata } from "next";
import { WorkWithMeClient } from "./work-with-me-client";

export const metadata: Metadata = {
  title: "Work With Me — AI Systems That Eliminate Your Busywork | Lucas Senechal",
  description:
    "Stop losing deals to manual follow-ups. I build AI systems that handle admin, follow-ups, and repetitive ops so your team scales revenue without scaling headcount.",
  openGraph: {
    title: "Work With Me — AI Systems That Eliminate Your Busywork | Lucas Senechal",
    description:
      "Stop losing deals to manual follow-ups. I build AI systems that handle admin, follow-ups, and repetitive ops so your team scales revenue without scaling headcount.",
    url: "https://lucassenechal.com/work-with-me",
    siteName: "Lucas Senechal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work With Me — AI Systems That Eliminate Your Busywork | Lucas Senechal",
    description:
      "Stop losing deals to manual follow-ups. I build AI systems that handle admin, follow-ups, and repetitive ops so your team scales revenue without scaling headcount.",
  },
};

export default function WorkWithMePage() {
  return <WorkWithMeClient />;
}
