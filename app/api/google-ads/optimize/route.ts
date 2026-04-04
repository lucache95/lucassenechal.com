import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { requireAdmin } from '@/lib/auth/admin'
import { listCampaigns, getDetailedReport } from '@/lib/google-ads/client'
import { getPageMetrics } from '@/lib/analytics/client'
import { OPTIMIZER_SYSTEM_PROMPT, optimizerActionSchema } from '@/lib/optimizer/prompt'
import { executeActions, checkConcurrencyGuard } from '@/lib/optimizer/executor'

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dryRun') === 'true'

    // Concurrency guard
    if (!dryRun) {
      const recentRun = await checkConcurrencyGuard()
      if (recentRun) {
        return NextResponse.json(
          { error: 'Optimization already ran within the last 30 minutes. Try again later.' },
          { status: 429 }
        )
      }
    }

    // Pull data from both sources
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] })()

    const [campaigns, keywordReport, pageMetrics] = await Promise.all([
      listCampaigns(startDate, endDate),
      getDetailedReport(startDate, endDate, 'keyword'),
      getPageMetrics(startDate, endDate).catch(() => []),
    ])

    // Build prompt with data
    const dataPrompt = [
      '## Campaign Performance (last 7 days)',
      JSON.stringify(campaigns, null, 2),
      '',
      '## Keyword Performance',
      JSON.stringify(keywordReport.slice(0, 100), null, 2),
      '',
      '## Landing Page Analytics',
      JSON.stringify(pageMetrics, null, 2),
      '',
      'Analyze this data and provide specific optimization recommendations.',
    ].join('\n')

    // Get AI recommendations
    const { object: recommendations } = await generateObject({
      model: anthropic('claude-sonnet-4-5-20250514'),
      system: OPTIMIZER_SYSTEM_PROMPT,
      prompt: dataPrompt,
      schema: optimizerActionSchema,
    })

    // Execute actions
    const results = await executeActions(recommendations.actions, dryRun)

    return NextResponse.json({
      summary: recommendations.summary,
      dryRun,
      actions: results,
      dataSnapshot: {
        campaignCount: campaigns.campaigns.length,
        totalSpend: campaigns.totals.cost,
        pagesAnalyzed: pageMetrics.length,
      },
    })
  } catch (err) {
    console.error('[google-ads/optimize POST]:', err)
    return NextResponse.json({ error: 'Optimization failed' }, { status: 500 })
  }
}
