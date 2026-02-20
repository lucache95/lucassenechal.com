---
phase: 01-foundation-landing-page
plan: 04
subsystem: ui
tags: [legal, privacy-policy, terms-of-service, gdpr, can-spam, tcpa]

# Dependency graph
requires:
  - phase: 01-foundation-landing-page/01
    provides: "Next.js project scaffold with Tailwind v4 theme and globals.css"
provides:
  - "Privacy policy page at /legal/privacy with data collection, retention, GDPR rights"
  - "Terms of service page at /legal/terms with acceptable use, SMS terms, liability"
  - "Shared legal layout with back-to-home navigation and prose typography"
  - "prose-legal CSS styles for consistent legal page formatting"
affects: [01-02-PLAN, 02-subscriber-flow]

# Tech tracking
tech-stack:
  added: []
  patterns: [legal-layout-wrapper, prose-legal-css-typography, next-metadata-per-page]

key-files:
  created:
    - app/(marketing)/legal/layout.tsx
    - app/(marketing)/legal/privacy/page.tsx
    - app/(marketing)/legal/terms/page.tsx
  modified:
    - app/globals.css

key-decisions:
  - "Used custom prose-legal CSS class instead of @tailwindcss/typography plugin to avoid extra dependency"
  - "Legal pages use (marketing) route group to share future marketing layout"
  - "Static generation for legal pages (no dynamic data needed)"

patterns-established:
  - "Legal layout pattern: shared layout.tsx with back nav + article wrapper for all /legal/* pages"
  - "Per-page metadata: export const metadata from each page.tsx for SEO"

requirements-completed: [LEGL-01, LEGL-02]

# Metrics
duration: 3min
completed: 2026-02-20
---

# Phase 1 Plan 04: Legal Pages Summary

**Privacy policy and terms of service with GDPR/CAN-SPAM/TCPA-compliant content, data retention timelines, and shared legal typography layout**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-20T20:19:36Z
- **Completed:** 2026-02-20T20:22:45Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Privacy policy at /legal/privacy with comprehensive coverage: data collection (7 data types), usage purposes, 5 third-party services with privacy links, specific retention timelines (30-day deletion, 5-year TCPA, 90-day analytics), user rights including GDPR portability
- Terms of service at /legal/terms covering service description, acceptable use, IP rights, SMS terms (TCPA-compliant STOP/HELP language), limitation of liability, and governing law
- Shared legal layout with back-to-home navigation and clean prose-legal typography styling
- Both pages verified building as static content with `npm run build` (0 errors)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create legal pages layout and privacy policy** - `ee61570` (feat)
2. **Task 2: Create terms of service page** - `001dcc3` (feat)

## Files Created/Modified
- `app/(marketing)/legal/layout.tsx` - Shared legal layout with back-to-home nav, max-w-3xl prose container
- `app/(marketing)/legal/privacy/page.tsx` - Full privacy policy (252 lines) covering all data practices
- `app/(marketing)/legal/terms/page.tsx` - Full terms of service (200 lines) covering acceptable use and SMS terms
- `app/globals.css` - Added prose-legal CSS styles for headings, paragraphs, lists, links, and last-updated date

## Decisions Made
- Used custom `.prose-legal` CSS class in globals.css instead of installing @tailwindcss/typography -- avoids extra dependency for 3 pages, gives full control over styling
- Legal pages placed in `(marketing)` route group to share future marketing layout (plan 01-02 creates this)
- Pages are Server Components with no client interactivity -- pure static content for best performance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `app/page.tsx` was found deleted (pre-existing issue in working directory) -- restored from git before committing
- Build lock file from prior build required cleanup -- removed `.next/lock` and rebuilt successfully

## User Setup Required

None - no external service configuration required for static legal pages.

## Next Phase Readiness
- Legal pages ready for footer link integration when plan 01-02 creates `components/landing/footer.tsx`
- Both pages accessible at /legal/privacy and /legal/terms
- Typography styles established in globals.css available for any future legal pages

## Self-Check: PASSED

- All 3 created files verified present on disk
- Commit ee61570 (Task 1) verified in git log
- Commit 001dcc3 (Task 2) verified in git log

---
*Phase: 01-foundation-landing-page*
*Completed: 2026-02-20*
