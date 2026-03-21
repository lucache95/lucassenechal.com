import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/email/token'

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams
  const subscriberId = searchParams.get('s')
  const itemUrl = searchParams.get('url')
  const value = searchParams.get('v')
  const token = searchParams.get('t')

  // Validate required params
  if (!subscriberId || !itemUrl || !value || !token) {
    return new NextResponse('Missing required parameters', { status: 400 })
  }

  // Validate signal value
  if (value !== 'more' && value !== 'less') {
    return new NextResponse('Invalid feedback value', { status: 400 })
  }

  // Verify HMAC token (action = 'feedback:{itemUrl}')
  if (!verifyToken(subscriberId, `feedback:${itemUrl}`, token)) {
    return new NextResponse('Invalid token', { status: 400 })
  }

  // Insert feedback with actual item URL
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from('subscriber_feedback').insert({
    subscriber_id: subscriberId,
    item_url: itemUrl,  // Actual URL, not an index
    signal: value,
  })

  // Return simple HTML confirmation
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Feedback Received</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc"><div style="text-align:center;padding:32px"><p style="color:#0f172a;font-size:18px;font-weight:600">Got it</p><p style="color:#64748b;font-size:15px">We'll tune your feed.</p></div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
