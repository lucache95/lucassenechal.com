/**
 * Static topic category and subtopic data structure.
 *
 * Uses stable slug-based IDs (not UUIDs) so the client-side data file
 * doesn't need to know DB-generated UUIDs. The Server Action will
 * resolve slugs to UUIDs by matching on name when persisting.
 *
 * Must stay in sync with the seed data in
 * supabase/migrations/002_subscriber_preferences.sql
 */

export interface Subtopic {
  id: string;
  name: string;
  displayOrder: number;
}

export interface TopicCategory {
  id: string;
  name: string;
  displayOrder: number;
  isPopular: boolean;
  subtopics: Subtopic[];
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'technology-ai',
    name: 'Technology & AI',
    displayOrder: 1,
    isPopular: true,
    subtopics: [
      { id: 'ai-tools-assistants', name: 'AI Tools & Assistants', displayOrder: 1 },
      { id: 'software-development', name: 'Software Development', displayOrder: 2 },
      { id: 'cybersecurity', name: 'Cybersecurity', displayOrder: 3 },
      { id: 'gadgets-hardware', name: 'Gadgets & Hardware', displayOrder: 4 },
      { id: 'cloud-infrastructure', name: 'Cloud & Infrastructure', displayOrder: 5 },
      { id: 'startups', name: 'Startups', displayOrder: 6 },
    ],
  },
  {
    id: 'business-finance',
    name: 'Business & Finance',
    displayOrder: 2,
    isPopular: true,
    subtopics: [
      { id: 'markets-investing', name: 'Markets & Investing', displayOrder: 1 },
      { id: 'entrepreneurship', name: 'Entrepreneurship', displayOrder: 2 },
      { id: 'real-estate', name: 'Real Estate', displayOrder: 3 },
      { id: 'personal-finance', name: 'Personal Finance', displayOrder: 4 },
      { id: 'crypto-web3', name: 'Crypto & Web3', displayOrder: 5 },
    ],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    displayOrder: 3,
    isPopular: false,
    subtopics: [
      { id: 'fitness-exercise', name: 'Fitness & Exercise', displayOrder: 1 },
      { id: 'nutrition-diet', name: 'Nutrition & Diet', displayOrder: 2 },
      { id: 'mental-health', name: 'Mental Health', displayOrder: 3 },
      { id: 'sleep-science', name: 'Sleep Science', displayOrder: 4 },
      { id: 'longevity', name: 'Longevity', displayOrder: 5 },
    ],
  },
  {
    id: 'local-community',
    name: 'Local & Community',
    displayOrder: 4,
    isPopular: false,
    subtopics: [
      { id: 'local-events', name: 'Local Events', displayOrder: 1 },
      { id: 'restaurant-food-scene', name: 'Restaurant & Food Scene', displayOrder: 2 },
      { id: 'community-news', name: 'Community News', displayOrder: 3 },
      { id: 'real-estate-market', name: 'Real Estate Market', displayOrder: 4 },
      { id: 'local-business', name: 'Local Business', displayOrder: 5 },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    displayOrder: 5,
    isPopular: true,
    subtopics: [
      { id: 'movies-tv', name: 'Movies & TV', displayOrder: 1 },
      { id: 'music', name: 'Music', displayOrder: 2 },
      { id: 'gaming', name: 'Gaming', displayOrder: 3 },
      { id: 'books-podcasts', name: 'Books & Podcasts', displayOrder: 4 },
      { id: 'celebrity-culture', name: 'Celebrity & Culture', displayOrder: 5 },
    ],
  },
  {
    id: 'science-innovation',
    name: 'Science & Innovation',
    displayOrder: 6,
    isPopular: false,
    subtopics: [
      { id: 'space-astronomy', name: 'Space & Astronomy', displayOrder: 1 },
      { id: 'climate-environment', name: 'Climate & Environment', displayOrder: 2 },
      { id: 'biotechnology', name: 'Biotechnology', displayOrder: 3 },
      { id: 'physics-engineering', name: 'Physics & Engineering', displayOrder: 4 },
      { id: 'emerging-tech', name: 'Emerging Tech', displayOrder: 5 },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    displayOrder: 7,
    isPopular: false,
    subtopics: [
      { id: 'travel', name: 'Travel', displayOrder: 1 },
      { id: 'food-cooking', name: 'Food & Cooking', displayOrder: 2 },
      { id: 'home-garden', name: 'Home & Garden', displayOrder: 3 },
      { id: 'fashion', name: 'Fashion', displayOrder: 4 },
      { id: 'parenting', name: 'Parenting', displayOrder: 5 },
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    displayOrder: 8,
    isPopular: false,
    subtopics: [
      { id: 'nfl-college-football', name: 'NFL & College Football', displayOrder: 1 },
      { id: 'nba-basketball', name: 'NBA & Basketball', displayOrder: 2 },
      { id: 'soccer', name: 'Soccer', displayOrder: 3 },
      { id: 'fantasy-sports', name: 'Fantasy Sports', displayOrder: 4 },
      { id: 'combat-sports', name: 'Combat Sports', displayOrder: 5 },
    ],
  },
];
