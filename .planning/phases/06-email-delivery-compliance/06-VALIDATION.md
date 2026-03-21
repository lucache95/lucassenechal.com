---
phase: 6
slug: email-delivery-compliance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | MAIL-01 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | MAIL-01 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 2 | MAIL-09 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | MAIL-02 | manual | see manual table | — | ⬜ pending |
| 06-02-02 | 02 | 1 | MAIL-05 | manual | see manual table | — | ⬜ pending |
| 06-02-03 | 02 | 1 | FDBK-01 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 1 | MAIL-03 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 06-03-02 | 03 | 1 | MAIL-06 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 06-03-03 | 03 | 2 | MAIL-07 | manual | see manual table | — | ⬜ pending |
| 06-04-01 | 04 | 1 | OPS-03 | manual | see manual table | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/email-pipeline.test.ts` — stubs for MAIL-01 (send pipeline, scheduling)
- [ ] `__tests__/email-compliance.test.ts` — stubs for MAIL-03 (unsubscribe headers, CAN-SPAM)
- [ ] `__tests__/feedback-links.test.ts` — stubs for FDBK-01 (feedback link generation)
- [ ] `__tests__/bounce-handling.test.ts` — stubs for MAIL-06 (bounce/complaint processing)

*Existing vitest infrastructure (vitest.config.ts) covers the framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Email renders correctly on mobile/desktop | MAIL-02 | Requires email client rendering | Send test email, open in Gmail + Apple Mail + Outlook Web |
| Consulting CTA engagement escalation | MAIL-05 | Requires engagement data over time | Subscribe, trigger open events, verify CTA escalates on next send |
| Domain warm-up ramp | MAIL-07 | Requires monitoring over days/weeks | Check Resend dashboard for graduated volume increases |
| Admin dashboard shows correct data | OPS-03 | Requires live data in UI | Load /admin/email, verify subscriber list and send status render |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
