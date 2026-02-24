'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface TopicHeroProps {
  icon: string;
  title: string;
  tagline: string;
}

export function TopicHero({ icon, title, tagline }: TopicHeroProps) {
  return (
    <section className="px-6 pb-16 pt-32 md:px-8 md:pb-20 md:pt-40">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumbs */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-label="Breadcrumb"
          className="mb-8"
        >
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-foreground"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/newsletter"
                className="transition-colors duration-200 hover:text-foreground"
              >
                Newsletter
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-foreground">{title}</span>
            </li>
          </ol>
        </motion.nav>

        {/* Icon + Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-start gap-6"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
            <span className="font-mono text-3xl font-bold text-accent">
              {icon}
            </span>
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-lg text-muted md:text-xl">{tagline}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
