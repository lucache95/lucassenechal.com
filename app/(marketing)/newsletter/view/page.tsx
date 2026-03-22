import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/email/token'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Daily Briefing | Lucas Senechal',
  robots: { index: false, follow: false }, // Private content, no indexing
}

// ---------------------------------------------------------------------------
// Error component for invalid links or missing content
// ---------------------------------------------------------------------------

function ErrorView({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Unable to load</h1>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Digest format renderer
// ---------------------------------------------------------------------------

function DigestView({ content, dateStr }: {
  content: {
    greeting: string
    items: Array<{ title: string; summary: string; url: string; sourceName: string }>
    signoff: string
  }
  dateStr: string
}) {
  return (
    <>
      <p className="text-slate-500 text-sm mb-6">{dateStr}</p>
      <p className="text-slate-600 text-base leading-relaxed mb-8">{content.greeting}</p>
      <hr className="border-slate-200 mb-8" />
      <div className="space-y-6">
        {content.items.map((item, i) => (
          <div key={i} className="pb-6 border-b border-slate-100 last:border-0">
            <h3 className="text-slate-900 font-semibold text-base mb-1">
              <a href={item.url} className="text-blue-500 hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-1">{item.summary}</p>
            <p className="text-slate-400 text-xs">via {item.sourceName}</p>
          </div>
        ))}
      </div>
      <hr className="border-slate-200 my-8" />
      <p className="text-slate-500 text-sm">{content.signoff}</p>
    </>
  )
}

// ---------------------------------------------------------------------------
// Briefing format renderer
// ---------------------------------------------------------------------------

function BriefingView({ content, dateStr }: {
  content: {
    intro: string
    sections: Array<{ heading: string; body: string; sourceUrls: string[] }>
    conclusion: string
  }
  dateStr: string
}) {
  return (
    <>
      <p className="text-slate-500 text-sm mb-6">{dateStr}</p>
      <p className="text-slate-600 text-base leading-relaxed mb-8">{content.intro}</p>
      <hr className="border-slate-200 mb-8" />
      <div className="space-y-8">
        {content.sections.map((section, i) => (
          <div key={i}>
            <h3 className="text-slate-700 text-xs font-semibold uppercase tracking-wide mb-3">{section.heading}</h3>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{section.body}</div>
          </div>
        ))}
      </div>
      <hr className="border-slate-200 my-8" />
      <p className="text-slate-500 text-sm">{content.conclusion}</p>
    </>
  )
}

// ---------------------------------------------------------------------------
// Mixed format renderer
// ---------------------------------------------------------------------------

function MixedView({ content, dateStr }: {
  content: {
    synthesis: string
    items: Array<{ title: string; oneLiner: string; url: string; sourceName: string }>
    signoff: string
  }
  dateStr: string
}) {
  return (
    <>
      <p className="text-slate-500 text-sm mb-6">{dateStr}</p>
      <p className="text-slate-600 text-base leading-relaxed mb-8">{content.synthesis}</p>
      <hr className="border-slate-200 mb-8" />
      <div className="space-y-5">
        {content.items.map((item, i) => (
          <div key={i} className="pb-5 border-b border-slate-100 last:border-0">
            <h3 className="text-base font-semibold mb-1">
              <a href={item.url} className="text-blue-500 hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-1">{item.oneLiner}</p>
            <p className="text-slate-400 text-xs">via {item.sourceName}</p>
          </div>
        ))}
      </div>
      <hr className="border-slate-200 my-8" />
      <p className="text-slate-500 text-sm">{content.signoff}</p>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main newsletter view page
// URL: /newsletter/view?s={subscriberId}&d={researchDate}&t={token}
// ---------------------------------------------------------------------------

export default async function NewsletterViewPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; d?: string; t?: string }>
}) {
  const params = await searchParams
  const subscriberId = params.s
  const researchDate = params.d
  const token = params.t

  if (!subscriberId || !researchDate || !token) {
    return <ErrorView message="Missing required parameters." />
  }

  if (!verifyToken(subscriberId, 'view-email', token)) {
    return <ErrorView message="Invalid or expired link." />
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: content } = await supabase
    .from('newsletter_content')
    .select('format, subject, content_json, research_date')
    .eq('subscriber_id', subscriberId)
    .eq('research_date', researchDate)
    .single()

  if (!content) {
    return <ErrorView message="Newsletter not found." />
  }

  // Format the research date for display
  const dateObj = new Date(content.research_date + 'T00:00:00')
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Render content based on format
  let contentView: React.ReactNode

  switch (content.format) {
    case 'digest':
      contentView = (
        <DigestView
          content={content.content_json as Parameters<typeof DigestView>[0]['content']}
          dateStr={dateStr}
        />
      )
      break
    case 'briefing':
      contentView = (
        <BriefingView
          content={content.content_json as Parameters<typeof BriefingView>[0]['content']}
          dateStr={dateStr}
        />
      )
      break
    case 'mixed':
      contentView = (
        <MixedView
          content={content.content_json as Parameters<typeof MixedView>[0]['content']}
          dateStr={dateStr}
        />
      )
      break
    default:
      return <ErrorView message="Unknown newsletter format." />
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">The Daily Briefing</h1>
        {contentView}
        <hr className="border-slate-200 my-8" />
        <p className="text-slate-400 text-xs text-center">
          Lucas Senechal &middot; The Daily Briefing
          <br />
          <a href="/preferences" className="text-blue-500 hover:text-blue-600 transition-colors">
            Manage your preferences
          </a>
        </p>
      </div>
    </div>
  )
}
