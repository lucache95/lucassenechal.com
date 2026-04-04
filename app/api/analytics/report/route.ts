import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPageMetrics } from '@/lib/analytics/client'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0]
    const startDate = searchParams.get('start') || (() => {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      return d.toISOString().split('T')[0]
    })()

    const pages = await getPageMetrics(startDate, endDate)
    return NextResponse.json({ pages, dateRange: { start: startDate, end: endDate } })
  } catch (err) {
    console.error('[analytics/report GET]:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
