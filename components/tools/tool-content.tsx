interface ToolContentProps {
  name: string;
  whatItIs: string;
  whyIUseIt: string;
  clientBenefits: string[];
}

export function ToolContent({
  name,
  whatItIs,
  whyIUseIt,
  clientBenefits,
}: ToolContentProps) {
  return (
    <section className="px-6 pb-16 md:px-8 md:pb-20">
      <div className="mx-auto max-w-3xl space-y-16">
        {/* What is [Tool]? */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What is {name}?
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted md:text-lg">
            {whatItIs.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Why I Use [Tool] */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Why I Use {name}
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted md:text-lg">
            {whyIUseIt.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* What This Means for You */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What This Means for You
          </h2>
          <ul className="space-y-3">
            {clientBenefits.map((benefit, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-base leading-relaxed text-muted md:text-lg"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
