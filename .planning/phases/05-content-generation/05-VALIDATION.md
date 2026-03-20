---
phase: 5
slug: content-generation
status: draft
nyquist_compliant: true
wave_0_complete: true
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
| 05-01-01 | 01 | 1 | CONT-01, CONT-02, CONT-03, QUAL-04 | unit | `npx vitest run lib/content/fallback.test.ts --reporter=verbose` | Yes (created in task) | pending |
| 05-01-02 | 01 | 1 | CONT-01, CONT-02, CONT-03, CONT-04 | unit | `npx vitest run lib/content/ --reporter=verbose` | Yes (created in task) | pending |
| 05-02-01 | 02 | 2 | CONT-01, CONT-02, CONT-03, CONT-04, QUAL-04 | structural | `ls -la supabase/migrations/006_newsletter_content.sql supabase/functions/content-generation/index.ts supabase/functions/content-generation/deno.json && grep -c "Write like a knowledgeable friend" supabase/functions/content-generation/index.ts && grep -c "MIN_RESULTS_THRESHOLD" supabase/functions/content-generation/index.ts && grep -c "DigestSchema\|BriefingSchema\|MixedSchema" supabase/functions/content-generation/index.ts` | N/A (migration + Edge Function) | pending |
| 05-02-02 | 02 | 2 | QUAL-04 | structural | `grep -n "content-generation" supabase/functions/research-pipeline/index.ts && grep -c "functions/v1/content-generation" supabase/functions/research-pipeline/index.ts` | N/A (wiring) | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

All test files are created inline by Plan 05-01 tasks:
- `lib/content/fallback.test.ts` — created by Plan 05-01 Task 1 (covers QUAL-04)
- `lib/content/content-generator.test.ts` — created by Plan 05-01 Task 2 (covers CONT-01, CONT-02, CONT-03, CONT-04 automated checks)

No separate Wave 0 scaffold step is needed. Both test files are produced by their respective tasks via TDD (tdd="true").

*Existing vitest infrastructure covers all phase requirements — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Generated content matches Lucas's voice tone and style | CONT-04 | Subjective quality assessment requiring human judgment; automated tests verify the voice prompt is passed to the LLM (Test 9 in Plan 05-01 Task 2) but cannot judge output quality | Read 3 generated outputs; check against voice exemplars in system prompt; verify absence of banned phrases |
| Insufficient-results fallback message is helpful | QUAL-04 | Copy quality requires human review | Trigger with < 3 research results; verify message is actionable and not generic |

**CONT-04 note:** Automated coverage confirms the VOICE_SYSTEM_PROMPT is passed as the `system` parameter to `generateText` (Plan 05-01 Task 2, Test 9). The prompt itself contains the voice rules, banned phrases, anti-patterns, and exemplars. Whether the LLM *follows* those rules in output is inherently subjective and covered by the manual verification above.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (no MISSING references — test files created in-task)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
