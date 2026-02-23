import type { Tool } from "@/lib/data/tools";

interface JsonLdProps {
  tool: Tool;
}

export function JsonLd({ tool }: JsonLdProps) {
  const baseUrl = "https://lucassenechal.com";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.name,
        url: tool.officialUrl,
        applicationCategory: "DeveloperApplication",
        description: tool.whatItIs.slice(0, 200),
        author: {
          "@type": "Person",
          name: "Lucas Senechal",
          url: baseUrl,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: `${baseUrl}/tools`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: `${baseUrl}/tools/${tool.slug}`,
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
