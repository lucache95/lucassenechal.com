import type { Location } from '@/lib/data/locations';

interface LocationJsonLdProps {
  location: Location;
}

export function LocationJsonLd({ location }: LocationJsonLdProps) {
  const baseUrl = 'https://lucassenechal.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        name: `Lucas Senechal — AI Consulting in ${location.city}`,
        description: location.metaDescription,
        url: `${baseUrl}/locations/${location.slug}`,
        provider: {
          '@type': 'Person',
          name: 'Lucas Senechal',
          url: baseUrl,
          jobTitle: 'AI Automation Consultant',
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kelowna',
          addressRegion: 'BC',
          addressCountry: 'CA',
        },
        areaServed: {
          '@type': location.slug === 'okanagan' ? 'AdministrativeArea' : 'City',
          name: location.city,
          containedInPlace: {
            '@type': 'AdministrativeArea',
            name: 'British Columbia',
          },
        },
        priceRange: '$500–$25,000',
      },
      {
        '@type': 'FAQPage',
        mainEntity: location.faqs.map((faq) => ({
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
            name: `AI Consulting in ${location.city}`,
            item: `${baseUrl}/locations/${location.slug}`,
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
