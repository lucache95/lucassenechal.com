const baseUrl = 'https://lucassenechal.com';

export function HomepageJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': `${baseUrl}/#business`,
        name: 'Lucas Senechal — AI Systems Consulting',
        url: baseUrl,
        logo: `${baseUrl}/icon.png`,
        description:
          'AI automation and implementation consulting for businesses in Kelowna, BC and the Okanagan Valley. I build AI systems that scale revenue without scaling headcount.',
        telephone: '',
        email: 'lucas@lucassenechal.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kelowna',
          addressRegion: 'BC',
          addressCountry: 'CA',
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
        priceRange: '$500–$25,000',
        founder: { '@id': `${baseUrl}/#person` },
        knowsAbout: [
          'AI Automation',
          'AI Consulting',
          'Business Process Automation',
          'AI Implementation',
          'Chatbot Development',
          'AI Content Operations',
          'AI Google Ads Management',
        ],
      },
      {
        '@type': 'Person',
        '@id': `${baseUrl}/#person`,
        name: 'Lucas Senechal',
        url: baseUrl,
        jobTitle: 'AI Automation Consultant',
        description:
          'AI systems consultant based in Kelowna, BC. I build AI agents and automation systems that scale revenue without scaling headcount for small and medium businesses.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kelowna',
          addressRegion: 'BC',
          addressCountry: 'CA',
        },
        knowsAbout: [
          'Artificial Intelligence',
          'Business Automation',
          'AI Agents',
          'Process Consulting',
          'Claude AI',
          'Machine Learning',
          'Workflow Automation',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Lucas Senechal',
        publisher: { '@id': `${baseUrl}/#person` },
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
