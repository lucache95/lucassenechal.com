"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getLogoBySlug } from "@/lib/data/tool-logos";

interface ToolStackContextProps {
  name: string;
  howItFits: string;
  relatedTools: { slug: string; name: string }[];
}

export function ToolStackContext({
  name,
  howItFits,
  relatedTools,
}: ToolStackContextProps) {
  return (
    <section className="border-y border-border px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How {name} Fits the Stack
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted md:text-lg">
            {howItFits.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        {relatedTools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-10"
          >
            <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Related Tools
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {relatedTools.map((tool) => {
                const logoData = getLogoBySlug(tool.slug);
                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-all duration-200 hover:border-accent/30 hover:bg-accent/5"
                  >
                    {logoData && (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center [&>svg]:h-8 [&>svg]:w-8">
                        {logoData.logo}
                      </span>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {tool.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
