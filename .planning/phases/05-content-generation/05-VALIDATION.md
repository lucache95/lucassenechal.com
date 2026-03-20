---
phase: 5
slug: content-generation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run lib/content/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run lib/content/`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | CONT-01 | unit | `npx vitest run lib/content/types` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | CONT-01, CONT-02, CONT-03 | unit | `npx vitest run lib/content/generator` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | CONT-04 | unit | `npx vitest run lib/content/voice` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | QUAL-04 | unit | `npx vitest run lib/content/fallback` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lib/content/generator.test.ts` — stubs for CONT-01, CONT-02, CONT-03
- [ ] `lib/content/voice.test.ts` — stubs for CONT-04
- [ ] `lib/content/fallback.test.ts` — stubs for QUAL-04

*Existing vitest infrastructure covers all phase requirements — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Generated content matches Lucas's voice | CONT-04 | Subjective quality assessment requiring human judgment | Read 3 generated outputs; check against voice exemplars in system prompt |
| Insufficient-results fallback message is helpful | QUAL-04 | Copy quality requires human review | Trigger with < 3 research results; verify message is actionable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
