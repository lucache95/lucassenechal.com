// scripts/google-ads-auth.ts
import http from 'http'
import { execSync } from 'child_process'

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3456'
const SCOPES = [
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/analytics.readonly',
].join(' ')

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_ADS_CLIENT_ID or GOOGLE_ADS_CLIENT_SECRET in env')
  process.exit(1)
}

const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
  `client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`

console.log('\n🔐 Google Ads + Analytics OAuth2 Setup\n')
console.log('Opening browser for authorization...\n')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:3456`)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>Authorization failed</h1><p>You can close this tab.</p>')
    console.error('❌ Authorization denied:', error)
    server.close()
    process.exit(1)
  }

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>No code received</h1>')
    return
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json() as {
      refresh_token?: string
      access_token?: string
      error?: string
      error_description?: string
    }

    if (tokens.error) {
      throw new Error(`${tokens.error}: ${tokens.error_description}`)
    }

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>✅ Authorization successful!</h1><p>You can close this tab.</p>')

    console.log('✅ Authorization successful!\n')
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log('\nUpdate this value in your .env.local file.\n')
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' })
    res.end('<h1>❌ Token exchange failed</h1>')
    console.error('❌ Token exchange failed:', err)
  }

  server.close()
})

server.listen(3456, () => {
  execSync(`open "${authUrl}"`)
})
