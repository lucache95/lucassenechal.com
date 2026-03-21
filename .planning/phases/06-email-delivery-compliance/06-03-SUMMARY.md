---
phase: 06-email-delivery-compliance
plan: 03
subsystem: email-api-endpoints
tags: [api, email, feedback, unsubscribe, webhooks, tdd, compliance]
dependency_graph:
  requires: [06-01]
  provides: [feedback-endpoint, unsubscribe-endpoint, resend-webhook-handler]
  affects: [subscriber_feedback table, send_log table, subscribers table]
tech_stack:
  added: []
  patterns: [NextRequest/NextResponse API routes, HMAC token verification, RFC 8058 one-click unsubscribe, Supabase chained query pattern]
key_files:
  created:
    - app/api/feedback/route.ts
    - app/api/unsubscribe/route.ts
    - app/api/webhooks/resend/route.ts
    - app/api/feedback/__tests__/route.test.ts
    - app/api/unsubscribe/__tests__/route.test.ts
    - app/api/webhooks/__tests__/resend.test.ts
  modified: []
decisions:
  - "Feedback token action uses actual item URL (feedback:${itemUrl}) not an index — enables Phase 7 FDBK-02 URL-based matching"
  - "RFC 8058 POST unsubscribe returns empty 200 body — mail client one-click compatible"
  - "3-consecutive-bounce detection queries last 3 send_log rows ordered by sent_at desc"
  - "Spam complaint auto-unsubscribes via subscriber status update with unsubscribed_at timestamp"
metrics:
  duration: 3min
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_created: 6
  tests_written: 31
  tests_passed: 31
---

# Phase 06 Plan 03: Email Interaction API Endpoints Summary

One-liner: Three RFC-compliant API endpoints closing the email feedback loop — HMAC-authenticated feedback links storing actual item URLs, RFC 8058 one-click unsubscribe, and a Resend webhook handler driving auto-pause on bounces and auto-unsubscribe on complaints.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Failing tests: feedback and unsubscribe | 8f0dd39 | app/api/feedback/__tests__/route.test.ts, app/api/unsubscribe/__tests__/route.test.ts |
| 1 (GREEN) | Feedback and unsubscribe API endpoints | 6815151 | app/api/feedback/route.ts, app/api/unsubscribe/route.ts |
| 2 (RED) | Failing tests: Resend webhook handler | 68546c2 | app/api/webhooks/__tests__/resend.test.ts |
| 2 (GREEN) | Resend webhook handler | b188379 | app/api/webhooks/resend/route.ts |

## What Was Built

### Feedback Endpoint (`app/api/feedback/route.ts`)

GET `/api/feedback?s={subscriberId}&url={encodedUrl}&v={more|less}&t={hmacToken}`

- Validates all required parameters (s, url, v, t)
- Validates signal value (only 'more' or 'less' accepted)
- Verifies HMAC token with action `feedback:${itemUrl}` — binds token to the specific article URL
- Inserts into `subscriber_feedback` with the actual item URL (not an index)
- Returns inline HTML "Got it — We'll tune your feed." confirmation
- Invalid/missing params return 400

### Unsubscribe Endpoint (`app/api/unsubscribe/route.ts`)

POST `/api/unsubscribe?s={subscriberId}&t={hmacToken}` (RFC 8058 one-click)
- Verifies HMAC token with action `unsubscribe`
- Updates subscriber status to 'unsubscribed' with unsubscribed_at timestamp
- Returns 200 with empty body (RFC 8058 compliant — email clients send this automatically)

GET `/api/unsubscribe?s={subscriberId}&t={hmacToken}` (human confirmation)
- Same verification and DB update as POST
- Returns HTML confirmation page with "You've been unsubscribed from The Daily Briefing" copy
- Includes re-subscribe link back to /newsletter

### Resend Webhook Handler (`app/api/webhooks/resend/route.ts`)

POST `/api/webhooks/resend`

Handles 4 event types:
- `email.delivered` — updates send_log status to 'delivered', sets delivered_at
- `email.bounced` — updates send_log with 'bounced' + error message, then checks last 3 sends for this subscriber; if all bounced, sets subscriber status to 'paused'
- `email.complained` — updates send_log to 'complained', auto-sets subscriber to 'unsubscribed' with timestamp (CAN-SPAM compliance)
- `email.opened` — sets opened_at on send_log
- Unknown types — ignored gracefully, returns 200

All events return `{ received: true }` with 200 status.

## Test Coverage

31 tests across 3 test files, all passing:

- **Feedback (10 tests):** Missing params, invalid signal, invalid token, correct token action format, correct DB insert with actual URL, HTML content
- **Unsubscribe (9 tests):** POST empty body, POST missing params, GET HTML copy, GET calls DB update, invalid token cases
- **Webhook (12 tests):** All 4 event types, 3-bounce auto-pause logic, <3 bounces no pause, spam complaint auto-unsub, unknown events, all return `{ received: true }`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All created files exist on disk. All 4 task commits confirmed in git log:
- 8f0dd39: test(06-03) - failing tests for feedback and unsubscribe
- 6815151: feat(06-03) - feedback and unsubscribe endpoints implemented
- 68546c2: test(06-03) - failing tests for Resend webhook handler
- b188379: feat(06-03) - Resend webhook handler implemented

31/31 tests passing across 3 test files.
