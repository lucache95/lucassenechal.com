"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const stats = [
  { value: "100k+", label: "Followers built" },
  { value: "16h/day", label: "With AI systems" },
  { value: "24/7", label: "Your agent works" },
];

export function About() {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/[0.03] to-background" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          The person behind the agent
        </motion.p>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            {/* Glow effect behind image */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/20 via-transparent to-accent/10 blur-2xl" />

            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/lucas-senechal.jpg"
                alt="Lucas Senechal"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 448px, 50vw"
                priority
              />
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Name overlay on image */}
              <div className="absolute bottom-6 left-6">
                <p className="text-sm font-medium text-white/70">Kelowna, BC</p>
              </div>
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 grid grid-cols-3 gap-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-surface/80 px-3 py-3 text-center backdrop-blur-sm"
                >
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="mb-8 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Hey, I&apos;m Lucas.
            </h2>

            <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>
                I&apos;ve spent the last decade doing a bit of everything &mdash; marketing, sales,
                content creation, crypto, influencer management. Built social accounts to 100k+ followers.
                Helped brands turn attention into revenue.
              </p>

              <p className="text-xl font-semibold text-foreground md:text-2xl">
                Now I build AI agents that do the work for you.
              </p>

              <p>
                I spend morning to night working with the most cutting-edge AI technology available.
                Training systems, testing workflows, pushing limits. This newsletter is one of those
                systems &mdash; a trained agent that researches what <em className="text-foreground not-italic font-medium">you</em> care
                about and delivers it to your inbox every day.
              </p>

              <p>
                You don&apos;t need to keep up with AI. You don&apos;t need to scroll
                through feeds. My agent does it for you &mdash; better and faster than
                any human could.
              </p>
            </div>

            {/* Work with me */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="mailto:lucas@lucassenechal.com"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:opacity-90 hover:shadow-lg"
              >
                Work with me
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <span className="text-sm text-muted-foreground">
                Custom AI systems for your business
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;
