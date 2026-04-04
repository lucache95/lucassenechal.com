import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getDetailedReport } from '@/lib/google-ads/client'

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
    const level = (searchParams.get('level') || 'campaign') as 'campaign' | 'ad_group' | 'keyword'

    const report = await getDetailedReport(startDate, endDate, level)
    return NextResponse.json({ report, dateRange: { start: startDate, end: endDate }, level })
  } catch (err) {
    console.error('[google-ads/report GET]:', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
