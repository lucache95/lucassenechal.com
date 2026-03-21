import crypto from 'crypto'

const SECRET = process.env.EMAIL_LINK_SECRET!

export function generateToken(subscriberId: string, action: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(`${subscriberId}:${action}`)
    .digest('hex')
}

export function verifyToken(subscriberId: string, action: string, token: string): boolean {
  const expected = generateToken(subscriberId, action)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch {
    return false // malformed hex
  }
}
