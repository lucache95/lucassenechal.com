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
          jobTitle: 'AI Automation Consultant',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Kelowna',
            addressRegion: 'BC',
            addressCountry: 'CA',
          },
        },
        areaServed: [
          { '@type': 'City', name: 'Kelowna', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'West Kelowna', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Peachland', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Penticton', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Vernon', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Summerland', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'City', name: 'Lake Country', containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
          { '@type': 'Country', name: 'Canada' },
          { '@type': 'Country', name: 'United States' },
        ],
        offers: {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'USD',
          },
          price: service.pricing,
          description: service.pricing,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${service.title} — What's Included`,
          itemListElement: service.whatsIncluded.map((item, index) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: item,
            },
            position: index + 1,
          })),
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
