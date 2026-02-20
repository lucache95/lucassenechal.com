import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-hover px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/legal/privacy"
            className="text-muted transition-colors duration-200 hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/legal/terms"
            className="text-muted transition-colors duration-200 hover:text-foreground"
          >
            Terms of Service
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {currentYear} Lucas Senechal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
