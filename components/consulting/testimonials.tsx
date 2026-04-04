"use client";

const testimonials = [
  {
    name: "Mike Chamberlain",
    quote:
      "I started working with Lucas on the advice of a trusted colleague and could not be happier with that decision. He took the time necessary to understand my needs and delivered exactly what I was looking for.",
    rating: 5,
  },
  {
    name: "A. Khan",
    quote:
      "Knowledgeable and professional — able to provide timely resolutions. I look forward to continuing to work with Lucas and his team.",
    rating: 5,
  },
  {
    name: "Darcy S.",
    quote:
      "Lucas went out of his way to answer all of my questions. I really appreciate the fast responses and enthusiasm given when dealing with this company.",
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
