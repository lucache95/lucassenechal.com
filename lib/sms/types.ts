export interface SmsSendLogEntry {
  subscriber_id: string
  twilio_sid?: string
  message_body: string
  direction: 'outbound' | 'inbound'
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'
  error?: string
}

export interface SmsConversationMessage {
  role: 'user' | 'assistant'
  content: string
  session_date: string // YYYY-MM-DD
}

export interface SmsDeliveryPayload {
  subscriber_id: string
  research_date: string
  enqueued_at: string
  retry_count: number
}
