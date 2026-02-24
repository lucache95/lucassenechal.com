import type { TopicPage } from '@/lib/data/topic-pages';

interface TopicJsonLdProps {
  topic: TopicPage;
}

export function TopicJsonLd({ topic }: TopicJsonLdProps) {
  const baseUrl = 'https://lucassenechal.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: topic.title,
        description: topic.metaDescription,
        url: `${baseUrl}/topics/${topic.slug}`,
        author: {
          '@type': 'Person',
          name: 'Lucas Senechal',
          url: baseUrl,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: topic.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Newsletter',
            item: `${baseUrl}/newsletter`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: topic.title,
            item: `${baseUrl}/topics/${topic.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
