---
phase: 4
slug: ai-research-engine
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (already in project via Next.js tooling) |
| **Config file** | vitest.config.ts (Wave 0 creates if needed) |
| **Quick run command** | `npx vitest run --reporter=verbose lib/research/` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose lib/research/`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 04-01-01 | 01 | 1 | RSCH-01 | unit | `npx vitest run lib/research/topic-parser.test.ts` | ⬜ pending |
| 04-01-02 | 01 | 1 | RSCH-01 | unit | `npx vitest run lib/research/query-generator.test.ts` | ⬜ pending |
| 04-02-01 | 02 | 1 | OPS-01 | manual | Verify pgmq queue created in Supabase SQL editor | ⬜ pending |
| 04-02-02 | 02 | 1 | OPS-01, OPS-02 | manual | Verify pg_cron job created and pg_net extension enabled | ⬜ pending |
| 04-02-03 | 02 | 1 | OPS-01 | unit | `npx vitest run lib/research/run-logger.test.ts` | ⬜ pending |
| 04-03-01 | 03 | 2 | RSCH-02 | unit | `npx vitest run lib/research/sources/brave.test.ts` | ⬜ pending |
| 04-03-02 | 03 | 2 | RSCH-03 | unit | `npx vitest run lib/research/sources/gdelt.test.ts` | ⬜ pending |
| 04-03-03 | 03 | 2 | RSCH-04 | unit | `npx vitest run lib/research/sources/rss.test.ts` | ⬜ pending |
| 04-04-01 | 04 | 2 | RSCH-07, RSCH-08 | unit | `npx vitest run lib/research/sources/scraper.test.ts` | ⬜ pending |
| 04-05-01 | 05 | 3 | RSCH-10 | unit | `npx vitest run lib/research/url-verifier.test.ts` | ⬜ pending |
| 04-05-02 | 05 | 3 | QUAL-01 | unit | `npx vitest run lib/research/deduplicator.test.ts` | ⬜ pending |
| 04-05-03 | 05 | 3 | QUAL-02 | unit | `npx vitest run lib/research/freshness.test.ts` | ⬜ pending |
| 04-06-01 | 06 | 3 | RSCH-11 | unit | `npx vitest run lib/research/cluster.test.ts` | ⬜ pending |
| 04-06-02 | 06 | 3 | QUAL-03 | unit | `npx vitest run lib/research/relevance-scorer.test.ts` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lib/research/__tests__/` directory created
- [ ] `vitest.config.ts` — configure if not exists
- [ ] Test stubs for topic-parser, query-generator, run-logger, brave, gdelt, rss, scraper, url-verifier, deduplicator, freshness, cluster, relevance-scorer

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| pgmq queue created in Supabase | OPS-01 | Requires Supabase SQL editor access | Run: `select * from pgmq.list_queues()` in SQL editor, verify `research_jobs` appears |
| pg_cron job schedules Edge Function | RSCH-09 | Requires Supabase cron dashboard | Check Supabase → Database → Cron Jobs, verify daily 6am UTC job exists |
| Edge Function deployed | RSCH-09 | Requires supabase CLI auth | Run `supabase functions list`, verify `research-pipeline` function exists |
| Brave API returns real results | RSCH-02 | Requires live API key | Manual curl: `curl -H "X-Subscription-Token: $BRAVE_API_KEY" "https://api.search.brave.com/res/v1/web/search?q=AI+regulation"` |
| GDELT returns recent articles | RSCH-03 | External service dependency | Fetch `https://api.gdeltproject.org/api/v2/doc/doc?query=artificial+intelligence&mode=artlist&format=json`, verify articles < 7 days old |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
