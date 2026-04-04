export interface Location {
  slug: string;
  city: string;
  region: string;
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  headline: string;
  intro: string;
  faqs: { question: string; answer: string }[];
}

export const LOCATIONS: Location[] = [
  {
    slug: 'kelowna',
    city: 'Kelowna',
    region: 'BC',
    metaTitle: 'AI Consulting & Automation in Kelowna, BC | Lucas Senechal',
    metaDescription:
      'AI consulting and automation services in Kelowna, BC. Custom AI systems, process automation, and implementation for local businesses. From $500 assessments to full implementations.',
    tagline: 'AI systems that scale your Kelowna business without scaling headcount.',
    headline: 'AI Consulting & Automation in Kelowna',
    intro:
      'Kelowna businesses are sitting on massive efficiency gains. From wineries and tourism operators to real estate teams and professional services firms, most local businesses still run on manual processes that AI can handle faster and cheaper.\n\nI build custom AI systems for Kelowna businesses — not off-the-shelf chatbots, but purpose-built automation that connects to your existing tools and handles the repetitive work your team does every day. Lead follow-ups, data entry, report generation, client onboarding, content creation — all automated, all monitored, all working 24/7.',
    faqs: [
      {
        question: 'How much does AI consulting cost in Kelowna?',
        answer:
          'AI consulting starts at $500 for a focused assessment of one workflow or process. A full operations audit runs $2,500 and covers your entire business. Implementation projects range from $5,000 to $25,000 depending on scope. Monthly management starts at $1,500. All pricing is fixed — no hourly billing surprises.',
      },
      {
        question: 'What types of Kelowna businesses benefit from AI automation?',
        answer:
          'Any business spending 10+ hours per week on repetitive tasks. In Kelowna specifically, I work with real estate teams, property management companies, wineries, tourism operators, professional services firms (accounting, legal, dental), trades businesses, and e-commerce brands. If your team does the same type of work repeatedly — follow-ups, data entry, scheduling, reporting — AI can handle it.',
      },
      {
        question: 'Do you work with businesses outside Kelowna?',
        answer:
          'Yes. I am based in Kelowna and serve the entire Okanagan Valley — West Kelowna, Peachland, Penticton, Vernon, Summerland, and Lake Country. I also work with remote clients across Canada and the US. Most of the work is done digitally, so location is flexible.',
      },
      {
        question: 'How long does an AI implementation take?',
        answer:
          'Simple single-workflow automations go live in 1-2 weeks. Multi-system integrations with complex logic take 4-6 weeks. You see working prototypes within the first week — not after months of development. Every project starts with a workflow audit so we build the right thing from day one.',
      },
      {
        question: 'What makes your AI consulting different from other tech companies in Kelowna?',
        answer:
          'I implement, not just advise. Every engagement produces a working AI system — not a strategy deck or a PowerPoint. I spend 16+ hours a day working with cutting-edge AI technology (Claude, GPT, custom agents, automation pipelines). I build the same systems for my own business that I build for clients. When I say something works, it is because I am running it myself.',
      },
    ],
  },
  {
    slug: 'west-kelowna',
    city: 'West Kelowna',
    region: 'BC',
    metaTitle: 'AI Consulting & Automation in West Kelowna, BC | Lucas Senechal',
    metaDescription:
      'AI consulting and automation for West Kelowna businesses. Custom AI systems for wineries, agriculture, tourism, and local services. Based in Kelowna, serving the Okanagan.',
    tagline: 'AI automation for West Kelowna businesses — from wineries to professional services.',
    headline: 'AI Consulting & Automation in West Kelowna',
    intro:
      'West Kelowna is home to some of the Okanagan\'s most productive businesses — wineries, agricultural operations, tourism companies, and growing professional services firms. Many of these businesses still rely on manual processes for tasks that AI handles faster, cheaper, and around the clock.\n\nI help West Kelowna businesses identify where AI saves the most time and money, then build and deploy the systems to make it happen. From automating tasting room bookings and inventory tracking for wineries to streamlining client intake for service businesses — the results are immediate and measurable.',
    faqs: [
      {
        question: 'Do you serve West Kelowna businesses?',
        answer:
          'Yes. I am based in Kelowna and work with businesses across the Okanagan Valley, including West Kelowna, Peachland, and Summerland. Most work is done remotely with occasional in-person meetings for workflow audits and kickoffs.',
      },
      {
        question: 'What AI services do you offer for wineries?',
        answer:
          'Wineries benefit from AI in several areas: automated tasting room booking and confirmation systems, inventory and production tracking, customer follow-up sequences after visits, social media content generation, email marketing automation, and review response management. A typical winery automation project saves 15-20 hours per week of staff time.',
      },
      {
        question: 'How much does AI automation cost for a small West Kelowna business?',
        answer:
          'Assessments start at $500. Full implementation projects range from $5,000 to $25,000 depending on the number of workflows automated and systems integrated. Most small businesses start with one high-impact workflow ($5,000-$8,000) and expand once they see results. ROI typically pays for the project within 2-3 months.',
      },
    ],
  },
  {
    slug: 'okanagan',
    city: 'Okanagan Valley',
    region: 'BC',
    metaTitle: 'AI Consulting & Automation in the Okanagan Valley, BC | Lucas Senechal',
    metaDescription:
      'AI consulting and automation for Okanagan Valley businesses. Serving Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, and Lake Country.',
    tagline: 'AI systems for Okanagan businesses — from Penticton to Vernon.',
    headline: 'AI Consulting & Automation in the Okanagan Valley',
    intro:
      'The Okanagan Valley is one of the fastest-growing regions in British Columbia, and local businesses are starting to discover what AI can do for their operations. Whether you run a winery in West Kelowna, a property management company in Penticton, a dental practice in Vernon, or a tourism business in Summerland — AI automation can eliminate the repetitive work that eats up your team\'s time.\n\nI am based in Kelowna and serve businesses across the entire Okanagan. I build custom AI systems that connect to your existing tools and automate the workflows that drain your team — lead follow-ups, data entry, client communications, content creation, report generation, and more.',
    faqs: [
      {
        question: 'What areas in the Okanagan do you serve?',
        answer:
          'I serve the entire Okanagan Valley: Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, and Lake Country. I also work with businesses in Kamloops, Salmon Arm, and throughout British Columbia. Most of the work is done remotely, so geography is flexible.',
      },
      {
        question: 'What industries in the Okanagan benefit most from AI?',
        answer:
          'The Okanagan has strong clusters in wine and agriculture, tourism and hospitality, real estate, construction and trades, healthcare (dental, chiropractic, optometry), and professional services (accounting, legal, insurance). All of these industries have repetitive workflows that AI handles well — booking management, client communications, data processing, inventory tracking, and marketing automation.',
      },
      {
        question: 'Can AI help my Okanagan tourism business?',
        answer:
          'Absolutely. Tourism businesses benefit from AI-powered booking confirmations and follow-ups, automated review responses across Google and TripAdvisor, seasonal marketing content generation, guest communication sequences, activity recommendations based on guest preferences, and social media content pipelines. A typical implementation saves 10-15 hours per week of staff time during peak season.',
      },
      {
        question: 'How do I get started with AI consulting in the Okanagan?',
        answer:
          'Start with a $500 focused assessment. I audit one specific workflow or process in your business, identify where AI adds value, and deliver a concrete implementation plan with ROI projections. If the numbers make sense, we move to implementation. No long-term commitments — you see results before you invest further.',
      },
    ],
  },
];

export function getLocationBySlug(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

export function getAllLocations(): Location[] {
  return LOCATIONS;
}

export function getAllLocationSlugs(): string[] {
  return LOCATIONS.map((l) => l.slug);
}
