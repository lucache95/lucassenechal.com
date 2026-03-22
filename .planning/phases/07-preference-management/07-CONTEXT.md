# Phase 7: Preference Management - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Subscribers can update all their preferences and unsubscribe without needing a login. Token-based access via links embedded in every email footer. Covers topics, format, delivery time, location, custom sources, SMS opt-in/out, and unsubscribe.

</domain>

<decisions>
## Implementation Decisions

### Preference Page Architecture
- Single scrolling page with sections (topics, format, delivery, sources, SMS, danger zone) — not a stepper
- Explicit "Save Changes" button per section — clear user intent, prevents accidental changes
- URL structure: `/preferences?s={id}&t={token}` — matches existing unsubscribe URL pattern
- Reuse data/schemas from Phase 2 (topic categories, format types) but build fresh UI — editing is not onboarding

### Token Security & UX
- No token expiry — HMAC is derived from subscriber ID + action, not time-based. Tokens auto-invalidate when subscriber is deleted
- Single token action for the whole preference page via `generateToken(id, 'preferences')` — Note: Phase 6 email-delivery Edge Function already ships tokens with action `'preferences'` (not `'manage'` as originally discussed). The action name `'preferences'` is the correct, shipped value.
- Invalid token shows simple error page with "Request a new link" email input — user enters email, receives fresh preferences link
- Unsubscribe placed in "danger zone" at bottom of preference page — red-bordered section with unsubscribe button, separated from other settings

### Editing UX & Flows
- Topic editing uses simplified checklist — flat list of checked/unchecked categories with custom topics as text area below (simpler than onboarding's expandable subtopics)
- Source management is inline list with add/remove — each source shows URL + delete button, "Add source" input at bottom
- No unsubscribe survey — immediate unsubscribe (current behavior), avoid friction
- Re-subscribe is one-click on confirmation page — "Changed your mind? Click to re-subscribe"

### Claude's Discretion
- Visual styling, spacing, and section ordering within the preference page
- Loading states and error handling patterns
- Mobile responsive layout approach

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/email/token.ts` — HMAC token generation/verification (`generateToken`, `verifyToken`)
- `lib/data/topics.ts` — Topic category data structure (8 categories with subtopics)
- `app/api/unsubscribe/route.ts` — Existing unsubscribe endpoint (RFC 8058 POST + GET with HTML confirmation)
- `app/api/feedback/route.ts` — Feedback endpoint with HMAC validation pattern
- `app/(marketing)/newsletter/` — Onboarding stepper components for reference

### Established Patterns
- Supabase service_role key for writes (bypasses RLS) — consistent across Phase 1, 2, 6
- Server Actions with `useActionState` for form submission
- HMAC token validation pattern: `?s={subscriberId}&t={token}` query params
- Framer Motion for animations (established in Phase 1)

### Integration Points
- Email footer links: all templates include manage preferences URL (uses `generateToken(id, 'preferences')`)
- DB tables: `subscriber_preferences`, `subscriber_topics`, `subscriber_custom_topics`, `subscriber_sources`
- Existing unsubscribe route at `/api/unsubscribe` — preference page danger zone should use same logic

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
