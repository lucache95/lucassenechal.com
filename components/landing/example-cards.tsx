"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface TopicCard {
  title: string;
  description: string;
  snippet: string;
  icon: string;
}

const topics: TopicCard[] = [
  {
    title: "AI Tools & Automation",
    description: "Latest releases, tutorials, and workflows",
    snippet:
      "OpenAI shipped GPT-5 Turbo overnight with 2x context. Three new open-source alternatives dropped on Hugging Face. Here's what matters for your stack...",
    icon: "~",
  },
  {
    title: "Local Deals & Events",
    description: "Restaurants, concerts, openings near you",
    snippet:
      "A new izakaya opened on 5th St with a soft-launch discount. The jazz festival lineup just dropped — tickets go live Thursday. Two Michelin picks added your neighborhood...",
    icon: "#",
  },
  {
    title: "Business Leads & Opportunities",
    description: "Markets, trends, and prospects",
    snippet:
      "Three companies in your niche just raised Series A. A competitor launched a new product line. Here are the gaps they're leaving open...",
    icon: "$",
  },
  {
    title: "Tech News",
    description: "Breaking releases and industry moves",
    snippet:
      "Apple announced a surprise hardware event. Google's latest research paper changes the game for edge computing. The React team shipped a major update...",
    icon: ">",
  },
  {
    title: "Health & Fitness",
    description: "Research, local gyms, and recipes",
    snippet:
      "New study links zone 2 cardio to 23% better cognitive function. A climbing gym opened nearby with intro pricing. Three high-protein recipes under 15 minutes...",
    icon: "+",
  },
  {
    title: "Finance & Markets",
    description: "Stocks, crypto, and economic trends",
    snippet:
      "Fed signaled a rate pause. Three stocks in your watchlist hit 52-week lows. Bitcoin broke through resistance — here's what on-chain data suggests next...",
    icon: "%",
  },
  {
    title: "Creative Inspiration",
    description: "Design trends, music, and art",
    snippet:
      "A new design system dropped from Linear's team. Radiohead's side project released an EP. MoMA just digitized 50,000 works — here's a curated selection...",
    icon: "*",
  },
  {
    title: "Career & Skills",
    description: "Job market, learning, and certifications",
    snippet:
      "Remote engineering salaries shifted 12% this quarter. Three free courses from MIT went live. A new certification is gaining traction with hiring managers...",
    icon: "^",
  },
];

function Card({ card, index }: { card: TopicCard; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      onTouchStart={() => setIsExpanded((prev) => !prev)}
      className="group cursor-default rounded-xl border border-border bg-surface p-5 transition-shadow duration-300 hover:shadow-lg hover:shadow-accent/5"
    >
      {/* Icon + Title */}
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-mono text-sm font-bold text-accent">
          {card.icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug text-foreground">
            {card.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{card.description}</p>
        </div>
      </div>

      {/* Expandable snippet */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-lg border border-dashed border-border bg-background p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sample briefing preview
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {card.snippet}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ExampleCards() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            See what your briefing could look like
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
            Pick any combination of topics. Your AI researches them overnight and delivers a
            personalized briefing by morning.
          </p>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topics.map((card, index) => (
            <Card key={card.title} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExampleCards;
