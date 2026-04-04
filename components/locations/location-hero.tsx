'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface LocationHeroProps {
  city: string;
  headline: string;
  tagline: string;
}

export function LocationHero({ city, headline, tagline }: LocationHeroProps) {
  return (
    <section className="px-6 pb-16 pt-32 md:px-8 md:pb-20 md:pt-40">
      <div className="mx-auto max-w-3xl">
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
              <span className="text-foreground">AI Consulting in {city}</span>
            </li>
          </ol>
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {headline}
          </h1>
          <p className="mt-4 text-lg text-muted md:text-xl">{tagline}</p>
        </motion.div>
      </div>
    </section>
  );
}
