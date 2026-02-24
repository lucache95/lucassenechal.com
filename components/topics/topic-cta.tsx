import Link from 'next/link';

export function TopicCTA() {
  return (
    <section className="px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Get This in Your Inbox
        </h2>
        <p className="mt-4 text-lg text-muted">
          Subscribe and choose the topics that matter to you. Your AI briefing
          is delivered every morning.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/newsletter"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent/90"
          >
            Subscribe to the Newsletter
          </Link>
          <Link
            href="/work-with-me"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-surface-hover"
          >
            Work With Me
          </Link>
        </div>
      </div>
    </section>
  );
}
