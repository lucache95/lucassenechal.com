/**
 * Topic page data for /topics/[slug] SEO pages.
 *
 * Separate from lib/data/topics.ts (subscriber preferences system).
 * Used by:
 *   - app/(marketing)/topics/[slug]/page.tsx
 *   - components/topics/*.tsx
 *   - app/sitemap.ts
 */

export interface TopicPage {
  slug: string;
  title: string;
  description: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  briefingIntro: string;
  sampleBriefing: string;
  sources: string[];
  faqs: { question: string; answer: string }[];
  relatedTopics: string[];
}

export const topicPages: TopicPage[] = [
  {
    slug: 'ai-tools-automation',
    title: 'AI Tools & Automation',
    description: 'Latest releases, tutorials, and workflows',
    icon: '~',
    metaTitle: 'AI Tools & Automation Briefing | Lucas Senechal Newsletter',
    metaDescription:
      'Get a daily AI briefing covering the latest tools, model releases, and automation workflows. Personalized and delivered every morning.',
    tagline: 'Stay ahead of every AI release, framework update, and automation workflow worth knowing.',
    briefingIntro:
      'Your AI Tools & Automation briefing monitors the fast-moving world of artificial intelligence — new model releases, open-source tools, prompt engineering techniques, and production-ready automation workflows. Instead of scrolling through dozens of newsletters and Twitter threads, you get the signal distilled into one morning read.',
    sampleBriefing:
      `**OpenAI shipped GPT-5 Turbo overnight with 2× context window**
The new model supports 256k tokens and benchmarks show a 40% improvement on complex reasoning tasks. The API pricing dropped to $3 per million input tokens, making it the most cost-effective frontier model available. Early reports from developers suggest significantly better instruction-following and reduced hallucination rates.

**Three open-source alternatives hit Hugging Face this week**
Mistral released Codestral 25.01 optimized for code generation. Meta dropped Llama 4 Scout with mixture-of-experts architecture. DeepSeek v3 is showing competitive benchmarks against GPT-4o at a fraction of the compute cost. All three are Apache 2.0 licensed.

**Anthropic's Claude now supports tool use in production**
The new tool use API lets Claude call external functions, search databases, and execute code during conversations. Early adopters report 3× improvements in task completion for complex multi-step workflows. This is a game-changer for building AI agents that actually do things.

**n8n shipped their AI Agent node**
The popular workflow automation platform now has native AI agent capabilities. You can build multi-step AI workflows with memory, tool calling, and conditional branching — all without writing code. Community templates are already available for lead qualification, content generation, and data enrichment.

**Practical tip: prompt caching is saving teams 80% on API costs**
Both OpenAI and Anthropic now support prompt caching. If you're running repetitive tasks with long system prompts, enabling caching can cut your bill dramatically. The setup takes about 5 minutes and requires zero code changes for most implementations.`,
    sources: [
      'OpenAI Blog & API changelog',
      'Hugging Face trending models',
      'Anthropic documentation updates',
      'GitHub trending repositories',
      'AI-focused newsletters (The Batch, TLDR AI)',
      'r/MachineLearning and r/LocalLLaMA',
      'Product Hunt AI launches',
      'ArXiv recent papers (cs.AI, cs.CL)',
    ],
    faqs: [
      {
        question: 'How quickly do new AI releases show up in the briefing?',
        answer:
          'Your briefing is generated overnight, so anything released or announced during the previous day will be included in your morning delivery. For major releases (new GPT models, significant open-source drops), coverage is typically within 12–24 hours.',
      },
      {
        question: 'Is this briefing technical or beginner-friendly?',
        answer:
          'The briefing adapts to your preferences. You can get high-level summaries of what matters and why, or dive into technical details like benchmark comparisons, API changes, and implementation tips. Most subscribers find the mix of both most useful.',
      },
      {
        question: 'Can I combine AI Tools with other topics in one briefing?',
        answer:
          'Absolutely. Most subscribers combine 3–5 topics. Your AI Tools section will appear alongside whatever other categories you select — local events, finance, health, or anything else.',
      },
    ],
    relatedTopics: ['tech-news', 'career-skills', 'business-leads-opportunities'],
  },
  {
    slug: 'local-deals-events',
    title: 'Local Deals & Events',
    description: 'Restaurants, concerts, openings near you',
    icon: '#',
    metaTitle: 'Local Deals & Events Briefing | Lucas Senechal Newsletter',
    metaDescription:
      'Never miss a restaurant opening, concert, or local deal again. Get a personalized local briefing delivered every morning.',
    tagline: 'Restaurant openings, concerts, deals, and community happenings — curated for your neighborhood.',
    briefingIntro:
      'Your Local Deals & Events briefing keeps you connected to what is happening in your area. New restaurant openings, concert announcements, farmers markets, pop-up shops, happy hour deals, and community events — all gathered from local sources and delivered in one morning read so you never miss what matters nearby.',
    sampleBriefing:
      `**A new izakaya opened on 5th Street with a soft-launch discount**
Kazu Izakaya quietly opened last Thursday with 30% off the full menu through this weekend. Early reviews mention the handmade udon and a solid sake selection. Reservations are available on Resy but filling fast — the 7pm and 8pm slots this Friday are already gone.

**The jazz festival lineup just dropped — tickets go live Thursday**
This year's headliners include Kamasi Washington and Nubya Garcia, with 40+ acts across three stages over the June 14–16 weekend. Early-bird pricing is $85 for a weekend pass. VIP packages with artist meet-and-greets are $250 and historically sell out within hours.

**Two Michelin picks added your neighborhood**
The 2025 Michelin guide just expanded coverage in your area. Noma pop-up alum "Root & Bone" earned a Bib Gourmand, and "Café Lune" picked up a Michelin Plate designation. Both are within a 10-minute walk.

**Weekend farmers market adding a night market pilot**
The Saturday farmers market is testing a Thursday evening format (5–9pm) starting next week. The pilot will run for 6 weeks and include food trucks, live music, and craft vendors alongside the usual produce sellers.

**Flash deal: local climbing gym offering $1 day passes this week**
Summit Climbing is running a grand-opening promotion at their new location. $1 day passes Monday through Friday, plus 20% off founding memberships locked in at the introductory rate for 12 months.`,
    sources: [
      'Yelp and Google Maps new openings',
      'Eventbrite and Meetup local listings',
      'Local newspaper event calendars',
      'Restaurant reservation platforms (Resy, OpenTable)',
      'City government event boards',
      'Local subreddits and community forums',
      'Groupon and local deal aggregators',
    ],
    faqs: [
      {
        question: 'How does the briefing know my location?',
        answer:
          'During signup, you specify your city or neighborhood. The AI uses that to filter for events, openings, and deals in your area. You can update your location anytime from your preferences.',
      },
      {
        question: 'How far in advance are events listed?',
        answer:
          'Most events appear 1–2 weeks before they happen. Ticket sales and early-bird deals are highlighted as soon as they are announced so you have time to act.',
      },
      {
        question: 'Can I get alerts for specific types of events?',
        answer:
          'Yes. You can set subtopic preferences like "restaurants only" or "live music" to narrow what appears in your local section. The AI also learns from what you engage with over time.',
      },
    ],
    relatedTopics: ['creative-inspiration', 'health-fitness', 'finance-markets'],
  },
  {
    slug: 'business-leads-opportunities',
    title: 'Business Leads & Opportunities',
    description: 'Markets, trends, and prospects',
    icon: '$',
    metaTitle: 'Business Leads & Opportunities Briefing | Lucas Senechal Newsletter',
    metaDescription:
      'AI-curated business intelligence delivered daily. Funding rounds, competitor moves, market gaps, and partnership opportunities tailored to your industry.',
    tagline: 'Funding rounds, competitor moves, and market gaps — spotted before your competition sees them.',
    briefingIntro:
      'Your Business Leads & Opportunities briefing acts as a daily intelligence feed for your business. It monitors funding announcements, competitor launches, hiring signals, partnership opportunities, and market shifts relevant to your industry. Think of it as a research analyst that works overnight and delivers a concise report every morning.',
    sampleBriefing:
      `**Three companies in your niche just raised Series A**
ToolFlow ($12M, Sequoia) is building AI workflow automation for agencies. DataBridge ($8M, a16z) focuses on data pipeline management for mid-market companies. NexStep ($15M, Founders Fund) is targeting the same customer segment you serve with a freemium model. Worth watching: ToolFlow's product roadmap overlaps significantly with your Q3 plans.

**A competitor launched a new product line yesterday**
Acme Corp rolled out "Acme AI Assistant" — a chatbot product targeting small business owners. Pricing starts at $49/month, undercutting most competitors by 40%. Their landing page emphasizes "no technical setup required." Early social media reaction is mixed, with complaints about limited customization.

**Government RFP alert: $2.4M contract for digital transformation**
The county government posted an RFP for modernizing their permit system with AI-powered document processing. Deadline is March 15. Requirements align closely with your team's capabilities. Three other firms are expected to bid based on the pre-solicitation conference attendance list.

**Industry hiring signals suggest market expansion**
LinkedIn data shows a 45% increase in job postings for "AI integration specialist" across your sector in the last 30 days. Companies hiring aggressively: Microsoft, Salesforce, and three mid-stage startups. This usually precedes a wave of outsourced implementation work.

**Partnership opportunity flagged**
A SaaS company with 50k+ users in your target market just posted on their blog that they're looking for integration partners. Their API is well-documented and they offer revenue sharing on referred customers.`,
    sources: [
      'Crunchbase and PitchBook funding data',
      'SEC filings and press releases',
      'LinkedIn job posting trends',
      'Google Alerts for competitor brands',
      'Government procurement portals (SAM.gov)',
      'Industry-specific trade publications',
      'Product Hunt and tech launch platforms',
    ],
    faqs: [
      {
        question: 'How does the briefing know which leads are relevant to me?',
        answer:
          'During onboarding, you specify your industry, target market, and competitor names. The AI uses these to filter thousands of daily signals down to the handful that matter for your business.',
      },
      {
        question: 'Can I track specific companies?',
        answer:
          'Yes. You can add companies to a watchlist, and any news, funding events, or product launches from those companies will be highlighted in your briefing.',
      },
      {
        question: 'Is this useful for solopreneurs or just larger businesses?',
        answer:
          'Both. Solopreneurs use it to spot partnership opportunities and market gaps. Larger teams use it for competitive intelligence and strategic planning. The depth adapts to what you need.',
      },
    ],
    relatedTopics: ['finance-markets', 'ai-tools-automation', 'career-skills'],
  },
  {
    slug: 'tech-news',
    title: 'Tech News',
    description: 'Breaking releases and industry moves',
    icon: '>',
    metaTitle: 'Tech News Briefing | Lucas Senechal Newsletter',
    metaDescription:
      'A daily tech briefing that cuts through the noise. Major releases, industry shifts, and developer news — distilled into a 5-minute morning read.',
    tagline: 'Major releases, industry shifts, and developer news — without the noise.',
    briefingIntro:
      'Your Tech News briefing covers the technology stories that actually matter. Not every product launch or rumor — just the releases, acquisitions, policy changes, and technical breakthroughs that affect how you work and build. Curated from dozens of sources and distilled into a focused morning read.',
    sampleBriefing:
      `**Apple announced a surprise hardware event for next Tuesday**
Invitations went out this morning with the tagline "One more satisfying thing." Leaks point to a new Mac Pro with M4 Ultra and a refreshed Apple Vision Pro with a lower price point. Developer documentation updates suggest new APIs for spatial computing.

**Google's latest research paper changes the game for edge computing**
"TinyScale" describes a new technique for running 7B-parameter models on devices with just 4GB of RAM. Benchmark results show 90% of the quality of full-precision models. If this ships in Android 16, every phone becomes an AI device without cloud dependency.

**The React team shipped React 20 with a major architecture change**
React Server Components are now the default. Client components require an explicit "use client" directive (no change from 19, but the mental model shift is significant). New features include built-in form handling, optimistic updates, and a redesigned suspense boundary system. Migration guide is live on reactjs.org.

**EU's AI Act enforcement begins — here's what changes today**
Prohibited AI practices (social scoring, real-time biometric surveillance) are now enforceable with fines up to 7% of global revenue. High-risk AI systems have until August 2025 to comply with transparency requirements. Most US-based SaaS companies serving EU customers will need to update their documentation.

**GitHub Copilot now writes and runs tests automatically**
The new "Copilot Testing" feature generates unit tests, runs them in a sandboxed environment, and iterates until they pass. Currently available for Python and TypeScript, with JavaScript and Go coming next month. Early metrics show 60% of generated tests catch real bugs.`,
    sources: [
      'Hacker News front page',
      'The Verge and Ars Technica',
      'TechCrunch breaking news',
      'Official company engineering blogs',
      'GitHub trending and changelog',
      'WWDC, Google I/O, and conference announcements',
      'Developer-focused podcasts and newsletters',
    ],
    faqs: [
      {
        question: 'How is this different from just reading Hacker News?',
        answer:
          'Hacker News is a firehose — hundreds of posts a day with no personalization. Your briefing selects the 4–6 stories most relevant to your interests and adds context about why they matter. No comment threads to get lost in.',
      },
      {
        question: 'Does the briefing cover enterprise tech or just consumer products?',
        answer:
          'Both, weighted by your preferences. If you work in enterprise software, you will see more coverage of infrastructure, security, and B2B product launches. Consumer-focused subscribers get more device and app coverage.',
      },
      {
        question: 'Can I get notified about breaking news during the day?',
        answer:
          'The core product is a daily morning briefing. For time-sensitive topics, the AI flags anything urgent with a "breaking" label, but the delivery cadence stays daily to avoid notification fatigue.',
      },
    ],
    relatedTopics: ['ai-tools-automation', 'career-skills', 'finance-markets'],
  },
  {
    slug: 'health-fitness',
    title: 'Health & Fitness',
    description: 'Research, local gyms, and recipes',
    icon: '+',
    metaTitle: 'Health & Fitness Briefing | Lucas Senechal Newsletter',
    metaDescription:
      'Science-backed health insights, workout trends, and nutrition tips delivered daily. No fads — just what the research actually says.',
    tagline: 'Science-backed health insights, workout ideas, and nutrition tips — no fads, just evidence.',
    briefingIntro:
      'Your Health & Fitness briefing separates evidence from hype. It covers new exercise science research, nutrition studies, supplement evaluations, gym openings, and practical wellness tips — all grounded in what peer-reviewed research actually shows. No miracle cures or influencer fads.',
    sampleBriefing:
      `**New study links zone 2 cardio to 23% better cognitive function**
A 12-month randomized controlled trial published in JAMA Neurology found that adults who did 150+ minutes of zone 2 cardio per week showed significantly better performance on memory and executive function tests. The effect was strongest in the 40–60 age group. Zone 2 means conversational pace — you should be able to talk comfortably.

**A climbing gym opened nearby with intro pricing**
Summit Climbing just opened their third location, 0.8 miles from your area. Grand-opening special: $1 day passes this week, plus founding memberships at $59/month (normally $89). The facility includes bouldering walls, lead climbing, a yoga studio, and a weight room.

**Three high-protein recipes under 15 minutes**
Based on your nutrition preferences: (1) Greek yogurt parfait with hemp seeds and berries — 35g protein. (2) Canned salmon rice bowl with avocado and everything bagel seasoning — 42g protein. (3) Cottage cheese flatbread with tomato and basil — 28g protein. Full recipes linked.

**Creatine confirmed safe for long-term use in new meta-analysis**
A meta-analysis of 35 studies spanning 5+ years of supplementation found no adverse effects on kidney or liver function in healthy adults. The International Society of Sports Nutrition updated their position stand to recommend 3–5g daily for anyone engaged in resistance training.

**Sleep research update: the 10-3-2-1 rule gains clinical backing**
A Stanford sleep lab study validated the popular rule: no caffeine 10 hours before bed, no food 3 hours, no work 2 hours, no screens 1 hour. Participants who followed the protocol for 4 weeks reported 31% improvement in sleep quality scores and fell asleep 18 minutes faster on average.`,
    sources: [
      'PubMed and Google Scholar (exercise science, nutrition)',
      'JAMA, The Lancet, and NEJM health sections',
      'Examine.com supplement research',
      'Local gym and studio openings',
      'Fitness subreddits (r/fitness, r/bodyweightfitness)',
      'Registered dietitian blogs and podcasts',
      'Strava and fitness app trend data',
    ],
    faqs: [
      {
        question: 'Is the health information medically reviewed?',
        answer:
          'The briefing summarizes published peer-reviewed research and clearly cites sources. It is not medical advice and always recommends consulting a healthcare provider for personal health decisions.',
      },
      {
        question: 'Can I focus on specific areas like nutrition or strength training?',
        answer:
          'Yes. Subtopic preferences let you weight your briefing toward nutrition, exercise science, mental health, sleep, or supplements. You can adjust these anytime.',
      },
      {
        question: 'Do I need to be a gym regular to find this useful?',
        answer:
          'Not at all. Many subscribers are just interested in staying informed about health research and practical wellness tips. The briefing covers everything from walking habits to elite training science.',
      },
    ],
    relatedTopics: ['local-deals-events', 'creative-inspiration', 'career-skills'],
  },
  {
    slug: 'finance-markets',
    title: 'Finance & Markets',
    description: 'Stocks, crypto, and economic trends',
    icon: '%',
    metaTitle: 'Finance & Markets Briefing | Lucas Senechal Newsletter',
    metaDescription:
      'Daily market briefing covering stocks, crypto, economic indicators, and personal finance — data-driven insights without the hype.',
    tagline: 'Market moves, economic signals, and personal finance insights — data over hype.',
    briefingIntro:
      'Your Finance & Markets briefing delivers a clear-eyed view of what moved in the markets and why. It covers major indexes, individual stocks on your watchlist, cryptocurrency trends, economic indicators, and personal finance developments. No pump-and-dump hype — just data-driven context to inform your decisions.',
    sampleBriefing:
      `**Fed signaled a rate pause at yesterday's FOMC meeting**
The Federal Reserve held rates steady at 4.25–4.50% and removed language about "further increases." Chair Powell's press conference emphasized data dependency, but the dot plot shows a median expectation of two cuts by year-end. Bond markets immediately priced in a July cut at 78% probability.

**Three stocks in your watchlist hit 52-week lows**
NVIDIA (NVDA) dropped 8% on supply chain concerns out of Taiwan. Shopify (SHOP) fell 6% after weak Q4 guidance. CrowdStrike (CRWD) declined 5% following a downgrade from Morgan Stanley. In each case, the underlying business fundamentals remain intact — these may be entry opportunities if your thesis hasn't changed.

**Bitcoin broke through $95k resistance — here's what on-chain data suggests**
BTC crossed $95,000 for the first time since the January correction. On-chain metrics are bullish: exchange balances are at 3-year lows (accumulation signal), long-term holder supply is increasing, and the MVRV ratio suggests the market is not yet overheated. The ETF inflows this week totaled $2.1B.

**Personal finance: high-yield savings rates quietly dropped**
Several major online banks cut their APY this week. Ally went from 4.20% to 3.90%, Marcus from 4.10% to 3.85%. If you're holding significant cash, Treasury bills at 4.5%+ remain a better option. I-bonds reset their rate next month — current composite is 3.11%.

**Economic indicator watch: unemployment claims ticked up**
Initial jobless claims came in at 225,000, above the 210,000 estimate. Continuing claims rose to 1.89M. One week of data is noise, but this is the third consecutive week above estimates. Worth monitoring alongside next Friday's jobs report for a clearer trend.`,
    sources: [
      'Federal Reserve publications and FOMC minutes',
      'Bloomberg and Reuters market data',
      'SEC filings (10-K, 10-Q, 8-K)',
      'On-chain crypto analytics (Glassnode, CoinMetrics)',
      'Bureau of Labor Statistics releases',
      'Financial Times and Wall Street Journal',
      'FDIC rate tracking and Treasury.gov',
    ],
    faqs: [
      {
        question: 'Is this financial advice?',
        answer:
          'No. The briefing provides market data, context, and analysis to help you stay informed. It is not personalized financial advice. Always consult a licensed financial advisor for investment decisions.',
      },
      {
        question: 'Can I set up a stock watchlist?',
        answer:
          'Yes. During onboarding, you can add specific tickers to your watchlist. Any significant price moves, earnings reports, or analyst actions on those stocks will be highlighted in your briefing.',
      },
      {
        question: 'Does the briefing cover international markets?',
        answer:
          'It focuses primarily on US markets but includes significant international moves that affect US investors — major central bank decisions, geopolitical events, and global commodity prices.',
      },
    ],
    relatedTopics: ['business-leads-opportunities', 'tech-news', 'ai-tools-automation'],
  },
  {
    slug: 'creative-inspiration',
    title: 'Creative Inspiration',
    description: 'Design trends, music, and art',
    icon: '*',
    metaTitle: 'Creative Inspiration Briefing | Lucas Senechal Newsletter',
    metaDescription:
      'Daily creative briefing covering design trends, music releases, art exhibitions, and creative tools. Fuel your creative work every morning.',
    tagline: 'Design drops, music releases, art exhibitions, and creative tools — fuel for makers.',
    briefingIntro:
      'Your Creative Inspiration briefing is a daily dose of what is new and interesting in the creative world. Design system releases, album drops, gallery exhibitions, creative tool launches, typography trends, and visual inspiration — curated to spark ideas and keep your creative radar calibrated.',
    sampleBriefing:
      `**Linear released their design system as open source**
Linear's design team published their full component library, design tokens, and Figma files under MIT license. The system includes 200+ components with dark mode support, accessibility built in, and detailed documentation. It's already trending on GitHub with 3,000 stars in 24 hours.

**Radiohead's side project The Smile released a surprise EP**
Thom Yorke and Jonny Greenwood dropped "Bending Heavier" — 5 tracks recorded live in a converted church in Oxford. Critics are calling it their most accessible work since In Rainbows. Available on all streaming platforms, with a vinyl pre-order shipping in March.

**MoMA digitized 50,000 works — here's a curated selection**
The Museum of Modern Art completed their digital archive project. All 50,000 works are now viewable in high resolution online with detailed provenance and artist notes. Highlights for this week: a lesser-known Basquiat series, early Yayoi Kusama sketches, and the complete Bauhaus typography collection.

**Figma shipped AI-powered auto layout suggestions**
The latest Figma update includes an AI feature that suggests layout improvements based on design best practices. It analyzes spacing, alignment, and hierarchy, then offers one-click fixes. Early reviews say it's particularly useful for cleaning up responsive designs.

**Typography trend: variable fonts are going mainstream**
Google Fonts now offers 150+ variable font families, up from 40 last year. The performance benefits are significant — one variable font file replaces 6–8 static font files. Recursive, Inter, and the new Geist family are the most popular for web projects.`,
    sources: [
      'Dribbble and Behance trending projects',
      'GitHub trending (design tools category)',
      'Pitchfork, Bandcamp, and Spotify new releases',
      'Gallery and museum exhibition calendars',
      'Design-focused newsletters (Dense Discovery, Sidebar)',
      'Figma and Adobe product updates',
      'Creative coding communities (Processing, p5.js)',
    ],
    faqs: [
      {
        question: 'Is this just for designers?',
        answer:
          'No. The briefing covers a wide range of creative disciplines — music, visual art, typography, film, and creative technology. Anyone who wants to stay inspired and aware of cultural trends will find it valuable.',
      },
      {
        question: 'Can I focus on specific creative areas?',
        answer:
          'Yes. Subtopic preferences let you weight toward graphic design, music, fine art, creative coding, or other areas. The AI learns your tastes over time and adjusts the selection.',
      },
      {
        question: 'Are the music and art recommendations algorithm-driven?',
        answer:
          'The AI curates based on critical reception, cultural significance, and your stated preferences — not engagement metrics. The goal is discovery, not reinforcing what you already know.',
      },
    ],
    relatedTopics: ['local-deals-events', 'tech-news', 'career-skills'],
  },
  {
    slug: 'career-skills',
    title: 'Career & Skills',
    description: 'Job market, learning, and certifications',
    icon: '^',
    metaTitle: 'Career & Skills Briefing | Lucas Senechal Newsletter',
    metaDescription:
      'Stay competitive with daily career intelligence — salary trends, in-demand skills, free courses, and job market insights delivered every morning.',
    tagline: 'Salary shifts, in-demand skills, free courses, and job market signals — stay competitive.',
    briefingIntro:
      'Your Career & Skills briefing helps you stay competitive in a fast-changing job market. It tracks salary trends, emerging skill requirements, free and paid learning opportunities, certification news, and hiring signals across industries. Whether you are job hunting, negotiating a raise, or planning your next career move, this briefing gives you the data.',
    sampleBriefing:
      `**Remote engineering salaries shifted 12% this quarter**
Levels.fyi's Q1 report shows remote software engineering compensation increased 12% quarter-over-quarter, driven by AI/ML roles. The median remote senior engineer salary is now $195k. Biggest gains: AI engineers ($225k median, +18%), platform engineers ($185k, +10%), and security engineers ($190k, +15%).

**Three free courses from MIT went live this week**
MIT OpenCourseWare published new material: (1) "Practical Deep Learning" — 12 weeks of video lectures with hands-on projects. (2) "Data Engineering Fundamentals" — covering modern data stack tools like dbt, Airflow, and Snowflake. (3) "Systems Design for Scale" — architecture patterns used at companies processing 1M+ requests per second.

**A new certification is gaining traction with hiring managers**
The Google Cloud Professional Machine Learning Engineer certification saw a 300% increase in employer mentions on job postings this quarter. Preparation resources are free through Google's Skill Boost platform. Average salary premium for certified candidates: $15k–$25k over non-certified peers.

**LinkedIn's 2025 Jobs on the Rise report highlights**
Top emerging roles: AI Ethics Officer, Climate Tech Engineer, Fractional CTO, and Revenue Operations Manager. The report shows a 5× increase in "AI-adjacent" job titles — roles that aren't pure AI but require working knowledge of AI tools and concepts.

**Skill gap alert: prompt engineering is table stakes now**
A survey of 500 hiring managers found that 72% now expect candidates to demonstrate basic prompt engineering skills, regardless of role. This is no longer a differentiator — it's a baseline expectation. The most valued advanced skills: RAG implementation, fine-tuning, and AI agent orchestration.`,
    sources: [
      'Levels.fyi and Glassdoor salary data',
      'LinkedIn Jobs on the Rise and hiring trends',
      'MIT OpenCourseWare and Coursera new releases',
      'Google, AWS, and Azure certification updates',
      'Bureau of Labor Statistics occupational data',
      'Hacker News "Who is Hiring" threads',
      'Industry-specific recruiter newsletters',
    ],
    faqs: [
      {
        question: 'Is this only useful for tech workers?',
        answer:
          'The default focus is technology careers, but you can adjust the industry focus during onboarding. The briefing covers transferable skills, leadership development, and general career strategies that apply across industries.',
      },
      {
        question: 'Does the briefing recommend specific courses?',
        answer:
          'Yes. The AI highlights free and paid courses relevant to trending skills in your field. Recommendations are based on course quality, instructor reputation, and relevance to current job market demands — not affiliate commissions.',
      },
      {
        question: 'Can I use this to prepare for salary negotiations?',
        answer:
          'Absolutely. The briefing regularly includes salary benchmark data by role, location, and experience level. Having current market data is one of the most effective tools in any negotiation.',
      },
    ],
    relatedTopics: ['ai-tools-automation', 'business-leads-opportunities', 'tech-news'],
  },
];

export function getTopicBySlug(slug: string): TopicPage | undefined {
  return topicPages.find((t) => t.slug === slug);
}

export function getAllTopicPages(): TopicPage[] {
  return topicPages;
}

export function getAllTopicSlugs(): string[] {
  return topicPages.map((t) => t.slug);
}
