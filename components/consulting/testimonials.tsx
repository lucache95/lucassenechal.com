"use client";

const testimonials = [
  {
    name: "Mike Chamberlain",
    title: "Owner, GetYouDriving.ca",
    quote:
      "Upon meeting with Lucas I was immediately impressed. He took the time necessary to explain the service they provide and has lived up to every promise made. Always accessible, patient, and willing to explain the problem and solution in language I can understand.",
    rating: 5,
  },
  {
    name: "A. Khan",
    title: "Google Local Guide",
    quote:
      "I would definitely recommend the team at Sentec Business Solutions; they are knowledgeable and professional and were able to provide me with timely resolutions. I look forward to working with Lucas and his team!",
    rating: 5,
  },
  {
    name: "Darcy S.",
    title: "Owner, Vernon Spider Control",
    quote:
      "What an excellent service! Lucas went out of his way to answer all of my questions. I really appreciate the fast responses and enthusiasm. I recommend this service and give them a 10/10.",
    rating: 5,
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 fill-current"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            5.0 from 11 reviews on Google
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <Stars />
              <p className="mt-4 text-sm leading-relaxed text-muted">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium text-foreground">
                {t.name}
              </p>
              {t.title && (
                <p className="text-xs text-muted">{t.title}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
