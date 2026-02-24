import type { Service } from '@/lib/data/services';

interface ServiceJsonLdProps {
  service: Service;
}

export function ServiceJsonLd({ service }: ServiceJsonLdProps) {
  const baseUrl = 'https://lucassenechal.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: service.title,
        description: service.metaDescription,
        url: `${baseUrl}/services/${service.id}`,
        provider: {
          '@type': 'Person',
          name: 'Lucas Senechal',
          url: baseUrl,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: service.faqs.map((faq) => ({
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
            name: 'Work With Me',
            item: `${baseUrl}/work-with-me`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.title,
            item: `${baseUrl}/services/${service.id}`,
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
