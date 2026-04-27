import Link from 'next/link';

interface LocationCTAProps {
  city: string;
}

export function LocationCTA({ city }: LocationCTAProps) {
  return (
    <section className="px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ready to Automate Your {city} Business?
        </h2>
        <p className="mt-4 text-lg text-muted">
          Start with a $500 assessment. See exactly where AI saves you time and money.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/work-with-me"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent/90"
          >
            Work With Me
          </Link>
        </div>
      </div>
    </section>
  );
}
