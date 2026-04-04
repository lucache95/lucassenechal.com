# Google Ads + Analytics AI Integration

**Date:** 2026-04-04
**Status:** Design
**Approach:** API Routes + AI Decision Layer

## Overview

AI-powered Google Ads campaign management and landing page optimization. The system uses the Google Ads API for ad operations and Google Analytics Data API (GA4) for post-click funnel analysis. An AI optimizer correlates both data sources to make holistic advertising decisions.

## Architecture

```
Google Ads API ──┐
                 ├──> AI Optimizer (Claude Sonnet) ──> Actions + Logs
GA4 Data API ────┘

API Routes (Next.js) — all authenticated via Bearer token (ADMIN_SECRET):
  /api/google-ads/campaigns   GET    List campaigns with metrics
  /api/google-ads/campaigns   POST   Create campaign
  /api/google-ads/campaigns   PATCH  Update campaign (pause, bids, budget)
  /api/google-ads/report      GET    Performance report
  /api/google-ads/optimize    POST   AI analysis + automated actions
  /api/analytics/report       GET    Page performance metrics
  /api/analytics/funnel       GET    Funnel step tracking
```

## Authentication

All API routes are protected with a Bearer token check against `ADMIN_SECRET` (already in `.env.local`). This matches the existing pattern used by the admin dashboard.

```ts
function requireAuth(request: Request): void {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (token !== process.env.ADMIN_SECRET) {
    throw new Response('Unauthorized', { status: 401 })
  }
}
```

The OpenClaw AI agent includes this header when calling the API routes.

## Components

### 1. Google Ads Client (`lib/google-ads/client.ts`)

Thin wrapper around `google-ads-api` (v23, already installed). Initializes with OAuth2 credentials from environment variables. May need adding `google-ads-api` to `serverExternalPackages` in `next.config.ts` due to native gRPC bindings.

- **Customer account** (993-454-6525): ad operations on the individual account
- **Manager account** (552-352-9850): cross-account queries if managing multiple accounts

Environment variables (already in `.env.local`):
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID`
- `GOOGLE_ADS_MANAGER_ID`

### 2. Google Analytics Client (`lib/analytics/client.ts`)

Uses the `@google-analytics/data` package (GA4 Data API) to pull page-level metrics.

**Setup required:**
- Install `@google-analytics/data` package
- Enable the **Google Analytics Data API** in Google Cloud Console
- Re-run OAuth flow with additional scope `https://www.googleapis.com/auth/analytics.readonly` to get a new refresh token that covers both Google Ads and GA4
- Add `GA4_PROPERTY_ID` to `.env.local` — this is the **numeric Property ID** (e.g., `123456789`) found in GA4 Admin > Property Settings. This is NOT the Measurement ID (`G-ZR3S9N3827`) which is only for client-side tracking.

Environment variables needed:
- `GA4_PROPERTY_ID` (numeric, from GA4 Admin > Property Settings)
- OAuth refresh token with `analytics.readonly` scope (combined with `adwords` scope)

Metrics pulled:
- Bounce rate per page
- Average scroll depth
- Session duration
- Conversion events (form submissions, CTA clicks)
- Funnel step completion rates

### 3. API Routes

#### `GET /api/google-ads/campaigns`

Returns all campaigns with performance metrics (clicks, impressions, cost, conversions, CTR, CPC, ROAS). Supports date range query params. Uses the `report()` method for type-safe queries.

#### `POST /api/google-ads/campaigns`

Creates a new campaign using `customer.mutateResources()` with temporary resource IDs for atomic creation of the full resource chain: CampaignBudget → Campaign → AdGroup → AdGroupAd → AdGroupCriterion (keywords). Accepts:
- Campaign name, type (Search, Display, Shopping, PMax)
- Daily budget
- Target keywords (for Search)
- Audience targeting
- Ad copy (headlines, descriptions)
- Landing page URL

#### `PATCH /api/google-ads/campaigns`

Accepts an `actions` array to update campaign resources. Each action targets a specific resource type:
- `campaign`: pause/enable, modify budget
- `ad_group`: adjust bids
- `keyword`: add/remove/pause keywords
- `ad`: update ad copy

#### `GET /api/google-ads/report`

Pulls detailed performance report with breakdowns by campaign, ad group, keyword, device, location, and time period.

#### `GET /api/analytics/report`

Returns page-level analytics:
- Bounce rate, scroll depth, session duration per URL
- Top landing pages by traffic and engagement
- Device and location breakdowns

#### `GET /api/analytics/funnel`

Tracks conversion funnel steps for specified pages:
- Page view > CTA click > form start > form submit
- Drop-off percentages at each step
- Comparison across traffic sources

#### `POST /api/google-ads/optimize`

The AI optimizer endpoint. Includes concurrency guard and dry-run support.

**Concurrency guard:** Before executing, checks Supabase for an optimization run within the last 30 minutes. Rejects with 429 if one exists. Prevents duplicate actions and API quota exhaustion.

**Dry-run mode:** Pass `?dryRun=true` to get AI recommendations without executing them. Actions are logged with `status: 'dry_run'`. Recommended during initial testing and the test-account-to-live transition.

**Flow:**

1. Check concurrency guard
2. Pull last 7 days of Google Ads performance data
3. Pull matching GA4 analytics for landing pages receiving ad traffic
4. Send combined data to Claude Sonnet with optimization system prompt
5. Claude returns structured actions:
   ```json
   {
     "actions": [
       { "type": "pause_keyword", "id": "123", "reason": "CPA 3x above target" },
       { "type": "adjust_bid", "id": "456", "newBid": 1.50, "reason": "Strong CVR, increase position" },
       { "type": "flag_page", "url": "/work-with-me", "issue": "73% drop-off at pricing section" }
     ],
     "summary": "Paused 3 underperforming keywords, increased bids on 2 converters, flagged 1 landing page issue."
   }
   ```
6. Execute each action independently via Google Ads API. Each action is logged individually with its own status (success/failed). Partial failures do not abort remaining actions.
7. Log all actions + reasoning to Supabase `google_ads_actions` table
8. Page-side flags are surfaced in the dashboard for manual review
9. Return summary with per-action results

### 4. Supabase Logging

Table: `google_ads_actions`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| action_type | text | pause_keyword, adjust_bid, flag_page, etc. |
| target_id | text | Google Ads entity ID or page URL |
| reason | text | AI's reasoning |
| data | jsonb | Full action payload |
| created_at | timestamptz | When the record was created (default now()) |
| executed_at | timestamptz | When the action was executed (null for flagged/dry_run) |
| status | text | success, failed, flagged, dry_run |

Migration file: `supabase/migrations/009_google_ads_actions.sql`

### 5. AI System Prompt

The optimizer uses Claude Sonnet (`claude-sonnet-4-5-20250514`) for analytical reasoning over tabular performance data. Expected token usage: ~3-5k input (7 days of campaign + analytics data), ~1k output.

The system prompt instructs Claude to:
- Prioritize ROAS and CPA targets
- Cross-reference ad performance with landing page analytics
- Recommend pausing campaigns with high spend + poor landing page metrics
- Suggest bid increases for high-converting, low-position keywords
- Flag landing page issues rather than trying to fix them
- Always provide specific, actionable recommendations with reasoning
- Return structured JSON matching the action schema

## Data Flow

```
AI Agent (OpenClaw) calls:
  POST /api/google-ads/optimize
    │
    ├── Check concurrency guard (reject if run < 30 min ago)
    │
    ├── GET Google Ads performance (last 7 days)
    ├── GET GA4 analytics for ad landing pages
    │
    ├── Send to Claude Sonnet for analysis
    │   └── Returns structured actions
    │
    ├── If dryRun: log actions as dry_run, skip execution
    ├── Else: execute each action independently, log results
    │
    ├── Log to Supabase
    └── Return summary + per-action results
```

## File Structure

```
lib/
  google-ads/
    client.ts          # Google Ads API client wrapper
    types.ts           # TypeScript types for campaigns, reports
  analytics/
    client.ts          # GA4 Data API client
    types.ts           # Analytics types
  optimizer/
    prompt.ts          # AI system prompt and action schemas
    executor.ts        # Execute actions returned by AI
  auth/
    admin.ts           # Bearer token auth helper (shared)

app/api/
  google-ads/
    campaigns/route.ts # GET, POST, PATCH campaigns
    report/route.ts    # GET performance report
    optimize/route.ts  # POST AI optimization
  analytics/
    report/route.ts    # GET page analytics
    funnel/route.ts    # GET funnel tracking

supabase/
  migrations/
    009_google_ads_actions.sql  # Logging table

scripts/
  google-ads-auth.ts   # One-time OAuth token generator (reads creds from env)
```

## Prerequisites

- [x] Google Ads API enabled in Cloud Console
- [x] OAuth2 credentials (Desktop app)
- [x] Refresh token generated
- [x] `google-ads-api` v23 installed
- [ ] Install `@google-analytics/data` package
- [ ] Enable Google Analytics Data API in Cloud Console
- [ ] Re-run OAuth flow with combined scopes (`adwords` + `analytics.readonly`)
- [ ] Get GA4 Property ID (numeric) from GA4 Admin and add as `GA4_PROPERTY_ID` to `.env.local`
- [ ] Add `google-ads-api` to `serverExternalPackages` in `next.config.ts`
- [ ] Supabase migration for `google_ads_actions` table
- [ ] Clean up `scripts/google-ads-auth.ts` to read credentials from env vars

## Constraints

- **Access level**: Currently Test Account. Build works against test accounts now; switches to real accounts when Basic/Explorer Access is approved (zero code changes needed).
- **Explorer Access limits**: 2,880 operations/day (sufficient for single-account management).
- **Concurrency**: Optimize endpoint rejects calls within 30 minutes of last run.
- **Cost**: Uses Claude Sonnet for AI analysis. Each optimize call ~3-5k tokens input, ~1k tokens output.
- **Security**: All credentials via `.env.local` (not committed). All API routes authenticated via `ADMIN_SECRET` Bearer token.
