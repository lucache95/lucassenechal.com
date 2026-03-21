import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/email/token'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function unsubscribe(subscriberId: string) {
  const supabase = getSupabase()
  await supabase.from('subscribers').update({
    status: 'unsubscribed',
    unsubscribed_at: new Date().toISOString(),
  }).eq('id', subscriberId)
}

// RFC 8058: POST handler for one-click unsubscribe (email client sends POST automatically)
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const subscriberId = url.searchParams.get('s')
  const token = url.searchParams.get('t')

  if (!subscriberId || !token || !verifyToken(subscriberId, 'unsubscribe', token)) {
    return new NextResponse('Invalid request', { status: 400 })
  }

  await unsubscribe(subscriberId)

  // RFC 8058: return 200 with empty body
  return new NextResponse('', { status: 200 })
}

// GET handler: shows confirmation page (human clicks link in email)
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const subscriberId = url.searchParams.get('s')
  const token = url.searchParams.get('t')

  if (!subscriberId || !token || !verifyToken(subscriberId, 'unsubscribe', token)) {
    return new NextResponse('Invalid request', { status: 400 })
  }

  await unsubscribe(subscriberId)

  // Return HTML confirmation page per UI-SPEC copy
  return new NextResponse(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Unsubscribed</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc"><div style="text-align:center;padding:32px;max-width:480px"><p style="color:#0f172a;font-size:20px;font-weight:600;margin:0 0 12px">You've been unsubscribed</p><p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px">You've been unsubscribed from The Daily Briefing. You won't receive any more emails.</p><p style="margin:0"><a href="https://lucassenechal.com/newsletter" style="color:#3b82f6;text-decoration:underline;font-size:15px">Changed your mind? Re-subscribe here.</a></p></div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
