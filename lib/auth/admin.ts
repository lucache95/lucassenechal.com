import crypto from 'crypto'
import { NextResponse } from 'next/server'

export function requireAdmin(request: Request): NextResponse | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const tokenBuf = Buffer.from(token)
  const secretBuf = Buffer.from(process.env.ADMIN_SECRET)
  if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null // authorized
}
