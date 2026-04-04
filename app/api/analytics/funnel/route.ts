import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getFunnelReport } from '@/lib/analytics/client'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    if (!page) {
      return NextResponse.json({ error: 'Missing page parameter' }, { status: 400 })
    }

    const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0]
    const startDate = searchParams.get('start') || (() => {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      return d.toISOString().split('T')[0]
    })()

    const funnel = await getFunnelReport(page, startDate, endDate)
    return NextResponse.json(funnel)
  } catch (err) {
    console.error('[analytics/funnel GET]:', err)
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 })
  }
}
