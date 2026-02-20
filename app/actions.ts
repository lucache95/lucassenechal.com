'use server'

import { createClient } from '@supabase/supabase-js'

type SubscribeResult = { success?: boolean; error?: string }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function subscribeEmail(
  _prevState: SubscribeResult,
  formData: FormData
): Promise<SubscribeResult> {
  const rawEmail = formData.get('email')

  if (!rawEmail || typeof rawEmail !== 'string') {
    return { error: 'Please enter a valid email address' }
  }

  const email = rawEmail.trim().toLowerCase()

  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Please enter a valid email address' }
  }

  // Use service_role key to bypass RLS for server-side inserts
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { error } = await supabase.from('subscribers').insert({
      email,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    if (error) {
      // Postgres unique violation — email already exists
      if (error.code === '23505') {
        return { error: 'This email is already subscribed!' }
      }

      console.error('[subscribeEmail] Supabase insert error:', error)
      return { error: 'Something went wrong. Please try again.' }
    }

    return { success: true }
  } catch (err) {
    console.error('[subscribeEmail] Unexpected error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
