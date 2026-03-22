---
phase: 8
slug: sms-channel
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run lib/sms/ --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run lib/sms/ --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | SMS-01 | unit | `npx vitest run lib/sms/twilio-client.test.ts -x` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | SMS-02 | unit | `npx vitest run lib/sms/consent.test.ts -x` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 2 | SMS-03 | unit | `npx vitest run lib/sms/sms-summary.test.ts -x` | ❌ W0 | ⬜ pending |
| 08-02-02 | 02 | 2 | SMS-06 | unit | `npx vitest run lib/sms/quiet-hours.test.ts -x` | ❌ W0 | ⬜ pending |
| 08-03-01 | 03 | 2 | SMS-04 | unit | `npx vitest run lib/sms/conversation.test.ts -x` | ❌ W0 | ⬜ pending |
| 08-03-02 | 03 | 2 | SMS-05 | unit | `npx vitest run lib/sms/intent-parser.test.ts -x` | ❌ W0 | ⬜ pending |
| 08-03-03 | 03 | 2 | SMS-06 | integration | Manual -- requires Twilio test webhook | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lib/sms/twilio-client.test.ts` — stubs for SMS-01 (Twilio API call mocking)
- [ ] `lib/sms/consent.test.ts` — stubs for SMS-02 (consent record validation)
- [ ] `lib/sms/sms-summary.test.ts` — stubs for SMS-03 (summary generation with mocked AI)
- [ ] `lib/sms/conversation.test.ts` — stubs for SMS-04 (conversation context management)
- [ ] `lib/sms/intent-parser.test.ts` — stubs for SMS-05 (intent parsing schemas)
- [ ] `lib/sms/quiet-hours.test.ts` — stubs for SMS-06 (timezone-aware quiet hours)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| STOP webhook updates sms_opt_in | SMS-06 | Requires live Twilio webhook callback | Send STOP to toll-free number, verify DB update |
| Toll-free verification approved | SMS-01 | External Twilio approval process | Check Twilio Console for verification status |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
