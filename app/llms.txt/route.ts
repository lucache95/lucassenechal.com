import { getAllServices } from '@/lib/data/services';

export function GET() {
  const services = getAllServices();

  const serviceList = services
    .map((s) => `- [${s.title}](https://lucassenechal.com/services/${s.id}): ${s.description}`)
    .join('\n');

  const content = `# Lucas Senechal — AI Systems Consulting

> AI automation and implementation consulting for businesses in Kelowna, BC and the Okanagan Valley.

Lucas Senechal builds AI systems that scale revenue without scaling headcount. Services include custom AI automation, process consulting, AI implementation, chatbot development, content operations, and Google Ads management for small and medium businesses across Canada and the US.

Based in Kelowna, British Columbia, Lucas works with businesses in the Okanagan Valley including Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, and Lake Country. Clients range from 5-200 employees across industries including real estate, hospitality, professional services, e-commerce, and local service businesses.

## Services

${serviceList}

## Differentiators

- Execution-focused: every engagement produces working AI systems, not strategy decks
- Full-stack implementation: from workflow audit to production deployment
- Ongoing management available: systems are maintained and scaled over time
- Transparent pricing: fixed project costs from $500 assessments to $25,000 full implementations

## Location

Based in Kelowna, BC, Canada. Serving the Okanagan Valley (Kelowna, West Kelowna, Peachland, Penticton, Vernon, Summerland, Lake Country) and remote clients across Canada and the United States.

## Contact

- Website: https://lucassenechal.com
- Email: lucas@lucassenechal.com
- Work With Me: https://lucassenechal.com/work-with-me
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
