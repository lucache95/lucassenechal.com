"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/newsletter", label: "Newsletter" },
  { href: "/work-with-me", label: "Work With Me" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link
          href="/"
          className="text-lg font-semibold text-foreground transition-colors hover:text-foreground"
        >
          Lucas Senechal
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "text-sm font-medium text-foreground"
                    : "text-sm text-muted transition-colors hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </motion.header>
  );
}

export default NavBar;
