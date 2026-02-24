interface ServiceContentProps {
  title: string;
  whatItIs: string;
  howItWorks: string;
  whoItsFor: string;
  whatsIncluded: string[];
}

export function ServiceContent({
  title,
  whatItIs,
  howItWorks,
  whoItsFor,
  whatsIncluded,
}: ServiceContentProps) {
  return (
    <section className="px-6 pb-16 md:px-8 md:pb-20">
      <div className="mx-auto max-w-3xl space-y-16">
        {/* What is [Service]? */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What is {title}?
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted md:text-lg">
            {whatItIs.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How It Works
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted md:text-lg">
            {howItWorks.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Who It's For */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Who It&apos;s For
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted md:text-lg">
            {whoItsFor.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* What's Included */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What&apos;s Included
          </h2>
          <ul className="space-y-3">
            {whatsIncluded.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-base leading-relaxed text-muted md:text-lg"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
