---
phase: 06-email-delivery-compliance
plan: 04
subsystem: email
tags: [resend, deno, edge-function, pgmq, admin-dashboard, vitest, hmac]

requires:
  - phase: 06-01
    provides: "DB schema: send_log, subscriber_feedback, warm_up_config, email_delivery pgmq queue"
  - phase: 06-02
    provides: "React Email templates: DigestEmail, BriefingEmail, MixedEmail, FallbackEmail"
  - phase: 06-03
    provides: "API endpoints: feedback, unsubscribe, webhooks/resend"
  - phase: 05-01
    provides: "Content generation pipeline writing to newsletter_content table"

provides:
  - "Email delivery Deno Edge Function (supabase/functions/email-delivery/index.ts) — reads pgmq queue, renders HTML, sends via Resend"
  - "Send pipeline integration tests (16 tests) — verifies headers, scheduling, bounce handling, URL-based feedback tokens"
  - "Admin dashboard at /admin — subscriber list, stats cards, send status badges, expandable error traces"

affects: [phase-07, phase-08, ops-monitoring, email-deliverability]

tech-stack:
  added: []
  patterns:
    - "Deno Web Crypto API (crypto.subtle) for HMAC-SHA256 — identical output to Node.js crypto.createHmac"
    - "Template literal HTML builders in Deno Edge Function (no React in Deno runtime)"
    - "Call-count dispatch pattern for mocking multi-call Supabase chains in Vitest"
    - "Server Component + Client Component split for admin page (data fetching + interactivity)"

key-files:
  created:
    - supabase/functions/email-delivery/index.ts
    - lib/email/__tests__/send.test.ts
    - app/(marketing)/admin/page.tsx
    - components/admin/subscriber-table.tsx
    - components/admin/send-status-badge.tsx
    - components/admin/error-trace-panel.tsx
  modified: []

key-decisions:
  - "Deno Web Crypto API (crypto.subtle) used for HMAC-SHA256 token generation — produces identical hex to Node.js version, no external crypto library needed"
  - "HTML email built as template literal strings in Edge Function — @react-email/render depends on react-dom/server which is not Deno-compatible"
  - "Feedback tokens and feedback URL query parameter use actual item URLs (not indices) for Phase 7 FDBK-02 compatibility"
  - "500ms rate limiting between Resend sends to stay under 2 req/s limit"
  - "Admin page data fetched in 3 separate queries (subscribers, preferences, send_log) — acceptable for <200 subscribers; SQL view recommended at scale"
  - "Call-count dispatch pattern in Vitest mocks: vi.fn().mockImplementation with counter to handle multi-call Supabase chains"

patterns-established:
  - "escHtml() utility for template literal HTML safety — prevents XSS in subscriber-sourced content"
  - "htmlOpen() / htmlClose() fragment helpers in Edge Function — share boilerplate across all 4 HTML builders"
  - "ctaSection(ctaLevel) renders either soft text link or highlighted box — identical logic to React Email templates"

requirements-completed: [MAIL-01, MAIL-05, MAIL-08, MAIL-06, OPS-03]

duration: 6min
completed: 2026-03-21
---

# Phase 6 Plan 4: Email Delivery Summary

**Deno Edge Function reads pgmq queue and sends personalized HTML emails via Resend with RFC 8058 compliance headers, warm-up quota enforcement, and admin dashboard at /admin with stats + subscriber status table**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-21T22:29:12Z
- **Completed:** 2026-03-21T22:34:54Z
- **Tasks:** 3 (Task 0 pre-approved, Task 4 is human-verify checkpoint)
- **Files created:** 6

## Accomplishments

- Email delivery Edge Function that reads from `email_delivery` pgmq queue, checks warm-up daily limit, fetches newsletter content, renders format-specific HTML via 4 template literal builders, sends via Resend with `List-Unsubscribe` and `List-Unsubscribe-Post` headers, logs to `send_log`, archives queue messages, with 500ms rate limiting
- 16 integration tests across 4 suites: MAIL-01 headers compliance, MAIL-08 delivery scheduling, MAIL-09 bounce handling (single bounce + 3-consecutive-pause), FDBK-01 URL-based feedback tokens
- Admin dashboard at `/admin` requiring `ADMIN_SECRET` query param, showing 4 stats cards, filterable subscriber table with send status badges, expandable error traces, and empty states

## Task Commits

1. **Task 0: Verify SPF/DKIM/DMARC domain authentication** - pre-approved (domain verified via Resend API)
2. **Task 1: Email delivery Edge Function** - `fdf34f7` (feat)
3. **Task 2: Send pipeline integration tests** - `29584d3` (feat/TDD)
4. **Task 3: Admin dashboard page and components** - `f99cd46` (feat)

## Files Created/Modified

- `supabase/functions/email-delivery/index.ts` — Deno Edge Function: queue reader, 4 HTML builders, Resend sender, compliance headers
- `supabase/functions/email-delivery/deno.json` — already existed from phase setup (resend + supabase-js imports)
- `lib/email/__tests__/send.test.ts` — 16 send pipeline tests (headers, scheduling, bounce handling, feedback tokens)
- `app/(marketing)/admin/page.tsx` — Server Component admin dashboard with ADMIN_SECRET auth and Supabase queries
- `components/admin/subscriber-table.tsx` — Client component: search filter, subscriber rows, status badges, error traces
- `components/admin/send-status-badge.tsx` — Inline status badge (delivered=green, bounced=amber, failed=red)
- `components/admin/error-trace-panel.tsx` — Expandable error detail panel with toggle

## Decisions Made

- Deno Web Crypto API (`crypto.subtle`) used for HMAC-SHA256 — no external library needed, identical output to Node.js `crypto.createHmac`
- Template literal HTML builders instead of `@react-email/render` in Deno — react-dom/server is not Deno-compatible (Research Pitfall #2)
- Feedback tokens use actual item URLs as action string (`feedback:${item.url}`) for Phase 7 FDBK-02 compatibility
- 500ms delay between Resend sends to stay within 2 req/s rate limit
- `escHtml()` utility added to Edge Function for XSS safety in subscriber-sourced content (title, summary fields)
- Call-count dispatch in mock (`mockImplementation` with counter) to correctly mock multi-call Supabase chains in bounce handler tests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Vitest mock for bounce handler tests**
- **Found during:** Task 2 (send pipeline tests)
- **Issue:** Initial bounce handler mock used single `select` mock that didn't handle both the `subscriber_id` lookup (returning `.single()`) AND the 3-bounce check (returning `.order().limit()`). The webhook handler calls `.from('send_log').select()` twice with different chain structures.
- **Fix:** Replaced single mock with call-count dispatch: first call returns `.eq().single()` chain, second call returns `.eq().order().limit()` chain
- **Files modified:** `lib/email/__tests__/send.test.ts`
- **Verification:** All 16 tests pass
- **Committed in:** `29584d3` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug in test mock)
**Impact on plan:** Essential for correct test behavior. No scope creep.

## Issues Encountered

None beyond the mock chain fix above.

## Next Phase Readiness

- Complete email pipeline is operational: research → content generation → email delivery
- Admin dashboard ready for monitoring at `/admin?key={ADMIN_SECRET}`
- ADMIN_SECRET env var must be set for admin access
- Resend webhook at `https://lucassenechal.com/api/webhooks/resend` must be configured in Resend Dashboard for delivery tracking (email.delivered, email.bounced, email.complained, email.opened events)
- Task 4 (final human-verify checkpoint) pending user approval after deployment

---
*Phase: 06-email-delivery-compliance*
*Completed: 2026-03-21*
