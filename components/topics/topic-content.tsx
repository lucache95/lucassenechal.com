interface TopicContentProps {
  title: string;
  briefingIntro: string;
  sampleBriefing: string;
  sources: string[];
}

export function TopicContent({
  title,
  briefingIntro,
  sampleBriefing,
  sources,
}: TopicContentProps) {
  return (
    <section className="px-6 pb-16 md:px-8 md:pb-20">
      <div className="mx-auto max-w-3xl space-y-16">
        {/* What This Briefing Covers */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What This Briefing Covers
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted md:text-lg">
            {briefingIntro.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Sample Briefing */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Sample {title} Briefing
          </h2>
          <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-accent">
              Example briefing preview
            </p>
            <div className="space-y-4 text-sm leading-relaxed text-muted md:text-base">
              {sampleBriefing.split('\n\n').map((paragraph, i) => {
                const bold = paragraph.match(/^\*\*(.+?)\*\*$/m);
                if (paragraph.startsWith('**') && bold) {
                  const parts = paragraph.split('\n');
                  const heading = parts[0].replace(/\*\*/g, '');
                  const body = parts.slice(1).join('\n');
                  return (
                    <div key={i}>
                      <p className="font-semibold text-foreground">{heading}</p>
                      {body && <p className="mt-1">{body}</p>}
                    </div>
                  );
                }
                return <p key={i}>{paragraph}</p>;
              })}
            </div>
          </div>
        </div>

        {/* Sources Monitored */}
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Sources Monitored
          </h2>
          <ul className="space-y-3">
            {sources.map((source, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-base leading-relaxed text-muted md:text-lg"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {source}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
