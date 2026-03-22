import { createClient } from 'npm:@supabase/supabase-js@2'

// NOTE: In Deno Edge Functions, lib/ modules are NOT directly importable.
// The pipeline logic is inlined here or copied from lib/ sources.
// When the project scales, consider a shared module approach.
// For v1, the Edge Function contains the full pipeline inline.

const MAX_BATCH_SIZE = 50
const VISIBILITY_TIMEOUT = 300 // 5 minutes
const MAX_RETRIES = 3

// ============================================================
// SSRF Protection — Inlined from lib/research/feed-validator.ts
// CRITICAL: Custom feed URLs from subscribers MUST be validated
// before fetching to prevent Server-Side Request Forgery.
// ============================================================
const PRIVATE_IP_RANGES = [
  /^10\./,                          // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,                     // 192.168.0.0/16
  /^127\./,                          // 127.0.0.0/8 (loopback)
  /^169\.254\./,                     // 169.254.0.0/16 (link-local)
  /^0\./,                            // 0.0.0.0/8
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 unique local
  /^fe80:/i,                         // IPv6 link-local
]

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some(range => range.test(ip))
}

function validateFeedUrl(url: string): { valid: boolean; error?: string } {
  if (url.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length of 2048 characters' }
  }
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTPS feed URLs are allowed' }
  }
  if (!parsed.hostname) {
    return { valid: false, error: 'URL must have a hostname' }
  }
  const hostname = parsed.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '::1') {
    return { valid: false, error: 'Localhost URLs are not allowed' }
  }
  if (isPrivateIp(hostname)) {
    return { valid: false, error: 'Private/internal IP addresses are not allowed' }
  }
  return { valid: true }
}
// ============================================================

interface QueueMessage {
  msg_id: number
  message: {
    subscriber_id: string
    enqueued_at: string
    retry_count: number
  }
}

Deno.serve(async (req) => {
  const startTime = Date.now()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // Step 1: Read batch of messages from pgmq
    const { data: messages, error: readError } = await supabase.rpc('pgmq_read', {
      queue_name: 'research_jobs',
      vt: VISIBILITY_TIMEOUT,
      qty: MAX_BATCH_SIZE,
    })

    if (readError) {
      console.error('Failed to read pgmq:', readError.message)
      return new Response(JSON.stringify({ error: readError.message }), { status: 500 })
    }

    const jobs = (messages ?? []) as QueueMessage[]
    console.log(`Processing ${jobs.length} research jobs`)

    let processed = 0
    let failed = 0

    for (const job of jobs) {
      const { subscriber_id, retry_count } = job.message

      try {
        // Step 2: Create run log
        const { data: runData } = await supabase
          .from('research_runs')
          .insert({
            subscriber_id,
            started_at: new Date().toISOString(),
            status: 'running',
          })
          .select('id')
          .single()

        const runId = runData?.id

        // Step 3: Load subscriber context
        // Get selected subtopics with category names
        const { data: topics } = await supabase
          .from('subscriber_topics')
          .select(`
            topic_subtopics (
              name,
              topic_categories ( name )
            )
          `)
          .eq('subscriber_id', subscriber_id)

        const subtopicNames = (topics ?? []).map(
          (t: any) => t.topic_subtopics?.name
        ).filter(Boolean)

        const categoryNames = [...new Set(
          (topics ?? []).map(
            (t: any) => t.topic_subtopics?.topic_categories?.name
          ).filter(Boolean)
        )]

        // Get custom topics
        const { data: customTopics } = await supabase
          .from('subscriber_custom_topics')
          .select('description')
          .eq('subscriber_id', subscriber_id)

        const topicDescriptions = (customTopics ?? []).map(
          (t: any) => t.description
        )

        // Get custom feed URLs
        const { data: sources } = await supabase
          .from('subscriber_sources')
          .select('feed_url')
          .eq('subscriber_id', subscriber_id)

        const customFeedUrls = (sources ?? []).map(
          (s: any) => s.feed_url
        )

        // Get recent feedback signals (last 30 days) for query refinement (FDBK-02)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const { data: feedbackRows } = await supabase
          .from('subscriber_feedback')
          .select('item_url, signal')
          .eq('subscriber_id', subscriber_id)
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: false })
          .limit(50)

        const moreFeedback = (feedbackRows ?? [])
          .filter((f: any) => f.signal === 'more')
          .map((f: any) => f.item_url)
        const lessFeedback = (feedbackRows ?? [])
          .filter((f: any) => f.signal === 'less')
          .map((f: any) => f.item_url)

        // Step 4: Parse topics to search queries via Gemini
        // (Inline implementation -- Edge Function cannot import from lib/)
        const { generateObject } = await import('npm:ai@6')
        const { google } = await import('npm:@ai-sdk/google@3')
        const { z } = await import('npm:zod@4')

        const SearchQueriesSchema = z.object({
          queries: z.array(z.object({
            query: z.string(),
            intent: z.enum(['news', 'analysis', 'tools', 'events', 'general']),
            keywords: z.array(z.string()).min(2).max(5),
          })).min(1).max(5),
        })

        let queries: { query: string; intent: string; keywords: string[] }[] = []
        const hasContent = subtopicNames.length > 0 || categoryNames.length > 0 || topicDescriptions.length > 0

        if (hasContent) {
          const parts: string[] = []
          if (subtopicNames.length > 0) parts.push(`Selected topics: ${subtopicNames.join(', ')}`)
          if (categoryNames.length > 0) parts.push(`Categories: ${categoryNames.join(', ')}`)
          if (topicDescriptions.length > 0) parts.push(`Custom interests: ${topicDescriptions.join('; ')}`)

          if (moreFeedback.length > 0) {
            parts.push(`Subscriber liked articles from these URLs (find more like these): ${moreFeedback.slice(0, 10).join(', ')}`)
          }
          if (lessFeedback.length > 0) {
            parts.push(`Subscriber disliked articles from these URLs (avoid similar content): ${lessFeedback.slice(0, 10).join(', ')}`)
          }

          const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: SearchQueriesSchema,
            prompt: `Convert this subscriber's topic preferences into 3-5 search queries.\n\n${parts.join('\n')}\n\nRules:\n- Each query should be 3-8 words, optimized for web search\n- Extract the core intent\n- Extract 2-5 keywords per query for relevance scoring\n- Be specific: "AI regulation EU 2026" not "AI news"`,
          })
          queries = object.queries
        }

        // Step 5: Fan out to sources in parallel
        const braveApiKey = Deno.env.get('BRAVE_API_KEY')
        let totalCost = 0.001 // Gemini cost

        const sourcePromises: Promise<any[]>[] = []

        for (const q of queries) {
          // Brave search (with rate limiting -- sequential per query)
          if (braveApiKey && totalCost < 0.10) {
            sourcePromises.push(
              (async () => {
                const params = new URLSearchParams({
                  q: q.query, count: '10', freshness: 'pw',
                })
                try {
                  const res = await fetch(
                    `https://api.search.brave.com/res/v1/web/search?${params}`,
                    { headers: { 'Accept': 'application/json', 'X-Subscription-Token': braveApiKey } }
                  )
                  if (!res.ok) return []
                  const data = await res.json()
                  totalCost += 0.005
                  return (data.web?.results ?? []).slice(0, 10).map((r: any) => ({
                    url: r.url, urlHash: '', title: r.title, snippet: r.description,
                    sourceName: 'brave', publishedAt: r.page_age ? new Date(r.page_age) : null,
                    relevanceScore: 0,
                  }))
                } catch { return [] }
              })()
            )
          }

          // GDELT search
          sourcePromises.push(
            (async () => {
              try {
                const params = new URLSearchParams({
                  query: q.query, mode: 'ArtList', maxrecords: '25',
                  format: 'json', sort: 'DateDesc', timespan: '7d',
                })
                const res = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`)
                if (!res.ok) return []
                const data = await res.json()
                return (data.articles ?? []).map((a: any) => ({
                  url: a.url, urlHash: '', title: a.title, snippet: '',
                  sourceName: 'gdelt', publishedAt: null, relevanceScore: 0,
                }))
              } catch { return [] }
            })()
          )
        }

        // Process custom RSS feeds
        // SSRF PROTECTION: Each custom feed URL is validated before fetching.
        // Rejects HTTP, private IPs, localhost per lib/research/feed-validator.ts rules.
        if (customFeedUrls.length > 0) {
          const RssParser = (await import('npm:rss-parser@3')).default
          for (const feedUrl of customFeedUrls) {
            // SSRF validation gate — skip unsafe URLs
            const validation = validateFeedUrl(feedUrl)
            if (!validation.valid) {
              console.error(`SSRF: Skipping unsafe custom feed URL "${feedUrl}": ${validation.error}`)
              continue
            }

            sourcePromises.push(
              (async () => {
                try {
                  const parser = new RssParser({ timeout: 10000 })
                  const feed = await parser.parseURL(feedUrl)
                  return (feed.items ?? []).slice(0, 15).map((item: any) => ({
                    url: item.link ?? '', urlHash: '', title: item.title ?? 'Untitled',
                    snippet: (item.contentSnippet ?? '').slice(0, 300),
                    sourceName: 'custom_rss', publishedAt: item.isoDate ? new Date(item.isoDate) : null,
                    relevanceScore: 0,
                  })).filter((r: any) => r.url.length > 0)
                } catch { return [] }
              })()
            )
          }
        }

        // Default curated RSS feeds (inlined from lib/data/default-feeds.ts — Deno cannot import lib/)
        const DEFAULT_RSS_FEEDS = [
          { name: 'TechCrunch',            url: 'https://techcrunch.com/feed/' },
          { name: 'Ars Technica',          url: 'https://feeds.arstechnica.com/arstechnica/index' },
          { name: 'Hacker News',           url: 'https://hnrss.org/frontpage' },
          { name: 'The Verge',             url: 'https://www.theverge.com/rss/index.xml' },
          { name: 'Reuters',               url: 'https://www.rss.reuters.com/news/topNews' },
          { name: 'NPR News',              url: 'https://feeds.npr.org/1001/rss.xml' },
          { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
          { name: 'Benedict Evans',        url: 'https://www.ben-evans.com/feed' },
        ]

        // Fetch all 8 default RSS feeds in parallel — trusted hardcoded URLs, no SSRF validation needed
        const DefaultRssParser = (await import('npm:rss-parser@3')).default
        for (const feed of DEFAULT_RSS_FEEDS) {
          sourcePromises.push(
            (async () => {
              try {
                const parser = new DefaultRssParser({ timeout: 10000 })
                const feedData = await parser.parseURL(feed.url)
                return (feedData.items ?? []).slice(0, 15).map((item: any) => ({
                  url: item.link ?? '',
                  urlHash: '',
                  title: item.title ?? 'Untitled',
                  snippet: (item.contentSnippet ?? '').slice(0, 300),
                  sourceName: 'rss',
                  sourceUrl: feed.url,
                  publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
                  relevanceScore: 0,
                })).filter((r: any) => r.url.length > 0)
              } catch (err) {
                console.error(`Default RSS fetch failed for ${feed.name}: ${err}`)
                return []
              }
            })()
          )
        }

        // Wait for all sources
        const sourceResults = await Promise.allSettled(sourcePromises)
        let allResults: any[] = []
        const sourcesQueried: string[] = []

        for (const result of sourceResults) {
          if (result.status === 'fulfilled' && result.value.length > 0) {
            allResults.push(...result.value)
            const sourceName = result.value[0]?.sourceName
            if (sourceName && !sourcesQueried.includes(sourceName)) {
              sourcesQueried.push(sourceName)
            }
          }
        }

        // Step 6: Freshness filter (7 days)
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - 7)
        allResults = allResults.filter((r: any) => {
          if (!r.publishedAt) return true
          return new Date(r.publishedAt) >= cutoffDate
        })

        // Step 7: URL verification (HEAD requests in batches of 10)
        const verifiedResults: any[] = []
        for (let i = 0; i < allResults.length; i += 10) {
          const batch = allResults.slice(i, i + 10)
          const checks = await Promise.allSettled(
            batch.map(async (r: any) => {
              const controller = new AbortController()
              const timer = setTimeout(() => controller.abort(), 5000)
              try {
                const res = await fetch(r.url, {
                  method: 'HEAD', signal: controller.signal, redirect: 'follow',
                })
                return res.ok ? r : null
              } catch { return null }
              finally { clearTimeout(timer) }
            })
          )
          for (const check of checks) {
            if (check.status === 'fulfilled' && check.value) {
              verifiedResults.push(check.value)
            }
          }
        }

        // Step 8: Deduplication (SHA-256 hash, check 30-day history)
        for (const r of verifiedResults) {
          const normalized = new URL(r.url)
          normalized.search = ''; normalized.hash = ''
          const clean = normalized.toString().toLowerCase().replace(/\/$/, '')
          const encoder = new TextEncoder()
          const data = encoder.encode(clean)
          const hashBuffer = await crypto.subtle.digest('SHA-256', data)
          r.urlHash = Array.from(new Uint8Array(hashBuffer))
            .map((b: number) => b.toString(16).padStart(2, '0')).join('')
        }

        const urlHashes = verifiedResults.map((r: any) => r.urlHash)
        const { data: existingHashes } = await supabase
          .from('sent_url_hashes')
          .select('url_hash')
          .eq('subscriber_id', subscriber_id)
          .in('url_hash', urlHashes.length > 0 ? urlHashes : ['__none__'])

        const existingSet = new Set((existingHashes ?? []).map((h: any) => h.url_hash))
        const newResults = verifiedResults.filter((r: any) => !existingSet.has(r.urlHash))

        // Step 9: Relevance scoring (TF-IDF)
        const allKeywords = queries.flatMap(q => q.keywords)
        const scoredResults = newResults.map((r: any) => {
          const text = `${r.title} ${r.snippet}`.toLowerCase()
          const words = text.split(/\W+/).filter((w: string) => w.length > 2)
          const totalWords = words.length
          if (totalWords === 0) { r.relevanceScore = 0; return r }
          let score = 0
          for (const kw of allKeywords) {
            const term = kw.toLowerCase()
            const tf = words.filter((w: string) => w === term || w.includes(term)).length / totalWords
            const idf = Math.log(1 + 1 / allKeywords.length)
            score += tf * idf
          }
          r.relevanceScore = Math.min(score * 10, 1)
          return r
        }).sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)

        // Apply feedback-based score adjustment (FDBK-02)
        if (moreFeedback.length > 0 || lessFeedback.length > 0) {
          for (const r of scoredResults) {
            // Boost score if URL matches a "more" feedback domain
            const resultDomain = (() => { try { return new URL(r.url).hostname } catch { return '' } })()
            const moreMatch = moreFeedback.some((url: string) => {
              try { return new URL(url).hostname === resultDomain } catch { return false }
            })
            const lessMatch = lessFeedback.some((url: string) => {
              try { return new URL(url).hostname === resultDomain } catch { return false }
            })
            if (moreMatch) r.relevanceScore = Math.min(r.relevanceScore * 1.3, 1)
            if (lessMatch) r.relevanceScore = r.relevanceScore * 0.5
          }
          // Re-sort after adjustment
          scoredResults.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
        }

        // Step 10: Store results
        const resultsToStore = scoredResults.slice(0, 20) // Top 20 results max

        if (resultsToStore.length > 0) {
          await supabase.from('research_results').insert(
            resultsToStore.map((r: any) => ({
              subscriber_id,
              url: r.url,
              url_hash: r.urlHash,
              title: r.title,
              snippet: r.snippet || null,
              source_name: r.sourceName,
              source_url: r.sourceUrl || null,
              published_at: r.publishedAt ? new Date(r.publishedAt).toISOString() : null,
              relevance_score: r.relevanceScore,
              research_date: new Date().toISOString().split('T')[0],
            }))
          )

          // Record sent URL hashes for 30-day dedup
          await supabase.from('sent_url_hashes').upsert(
            resultsToStore.map((r: any) => ({
              subscriber_id,
              url_hash: r.urlHash,
            })),
            { onConflict: 'subscriber_id,url_hash', ignoreDuplicates: true }
          )
        }

        // Step 11: Complete run log
        if (runId) {
          await supabase.from('research_runs').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            queries_run: queries.length,
            sources_queried: sourcesQueried,
            results_found: allResults.length,
            results_stored: resultsToStore.length,
            cost_estimate_usd: totalCost,
          }).eq('id', runId)
        }

        // Step 11.5: Trigger content generation (fire-and-forget)
        // Phase 5: Content generation runs as a separate Edge Function for isolation:
        // - Different failure modes (research success != content success)
        // - Keeps research pipeline under 150s limit
        // - Content can be regenerated independently without re-running research
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')
          const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
          if (supabaseUrl && serviceRoleKey && resultsToStore.length > 0) {
            fetch(
              `${supabaseUrl}/functions/v1/content-generation`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${serviceRoleKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  subscriber_id,
                  research_date: new Date().toISOString().split('T')[0],
                }),
              }
            ).catch(err => {
              console.error(`Content generation trigger failed for ${subscriber_id}:`, err)
            })
          }
        } catch (err) {
          // Non-fatal: research results are already stored
          console.error(`Content generation trigger error for ${subscriber_id}:`, err)
        }

        // Step 12: Archive message (success)
        await supabase.rpc('pgmq_archive', {
          queue_name: 'research_jobs',
          msg_id: job.msg_id,
        })

        processed++
        console.log(`Processed subscriber ${subscriber_id}: ${resultsToStore.length} results stored`)

      } catch (err) {
        failed++
        console.error(`Failed for subscriber ${subscriber_id}:`, err)

        // Check retry count
        if (retry_count >= MAX_RETRIES) {
          // Dead-letter: delete message after 3 failures
          console.error(`Dead-lettering subscriber ${subscriber_id} after ${MAX_RETRIES} retries`)
          await supabase.rpc('pgmq_archive', {
            queue_name: 'research_jobs',
            msg_id: job.msg_id,
          })

          // Log failed run
          await supabase.from('research_runs').insert({
            subscriber_id,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            status: 'failed',
            errors: [{ source: 'pipeline', message: String(err), timestamp: new Date().toISOString() }],
          })
        }
        // Otherwise: message becomes visible again after VT expires (auto-retry)
        // The retry_count is in the message payload -- next consumer increments it
      }
    }

    const duration = Date.now() - startTime
    console.log(`Pipeline complete: ${processed} processed, ${failed} failed, ${duration}ms`)

    return new Response(JSON.stringify({
      processed,
      failed,
      total: jobs.length,
      durationMs: duration,
    }))

  } catch (err) {
    console.error('Pipeline fatal error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
