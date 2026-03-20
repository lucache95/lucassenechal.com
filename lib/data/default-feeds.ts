export interface DefaultFeed {
  name: string
  url: string
  category: string
}

export const DEFAULT_RSS_FEEDS: DefaultFeed[] = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Technology' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'Technology' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
  { name: 'Reuters', url: 'https://www.rss.reuters.com/news/topNews', category: 'World News' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', category: 'General News' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', category: 'AI/Tech Analysis' },
  { name: 'Benedict Evans', url: 'https://www.ben-evans.com/feed', category: 'Tech Analysis' },
]
