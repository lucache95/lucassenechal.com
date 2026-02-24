import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getServiceById,
  getAllServiceSlugs,
  getAllServices,
} from '@/lib/data/services';
import { ServiceJsonLd } from '@/components/services/service-json-ld';
import { ServiceHero } from '@/components/services/service-hero';
import { ServiceContent } from '@/components/services/service-content';
import { ServiceFAQ } from '@/components/services/service-faq';
import { ServiceCTA } from '@/components/services/service-cta';
import { Footer } from '@/components/landing/footer';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceById(slug);
  if (!service) return {};

  const baseUrl = 'https://lucassenechal.com';
  const url = `${baseUrl}/services/${service.id}`;

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: service.metaTitle,
      description: service.metaDescription,
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceById(slug);
  if (!service) notFound();

  return (
    <main>
      <ServiceJsonLd service={service} />
      <ServiceHero
        icon={service.icon}
        title={service.title}
        tagline={service.tagline}
      />
      <ServiceContent
        title={service.title}
        whatItIs={service.whatItIs}
        howItWorks={service.howItWorks}
        whoItsFor={service.whoItsFor}
        whatsIncluded={service.whatsIncluded}
      />
      <ServiceFAQ title={service.title} faqs={service.faqs} />
      <ServiceCTA />
      <Footer />
    </main>
  );
}
