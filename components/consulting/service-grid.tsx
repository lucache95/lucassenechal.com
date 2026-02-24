"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SERVICES } from "@/lib/data/services";

export function ServiceGrid() {
  return (
    <section className="px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What I Build
          </h2>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
              }}
            >
              <Link
                href={`/services/${service.id}`}
                className="block rounded-xl border border-border bg-surface p-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-accent/5"
              >
                <span className="mb-4 block text-3xl" role="img" aria-label={service.title}>
                  {service.icon}
                </span>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceGrid;
