export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="max-w-2xl px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          Lucas Senechal
        </h1>
        <p className="mt-6 text-lg text-muted">
          Your daily edge. Powered by AI. Coming soon.
        </p>
        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2 text-sm text-muted">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          Stack verified — Next.js + Tailwind v4 + Geist
        </div>
      </main>
    </div>
  );
}
