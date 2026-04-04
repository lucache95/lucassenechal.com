import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getLocationBySlug,
  getAllLocationSlugs,
} from '@/lib/data/locations';
import { LocationJsonLd } from '@/components/locations/location-json-ld';
import { LocationHero } from '@/components/locations/location-hero';
import { LocationServices } from '@/components/locations/location-services';
import { LocationFAQ } from '@/components/locations/location-faq';
import { LocationCTA } from '@/components/locations/location-cta';
import { Footer } from '@/components/landing/footer';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLocationSlugs().map((city) => ({ city }));
}

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } = await params;
  const location = getLocationBySlug(city);
  if (!location) return {};

  const baseUrl = 'https://lucassenechal.com';
  const url = `${baseUrl}/locations/${location.slug}`;

  return {
    title: location.metaTitle,
    description: location.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: location.metaTitle,
      description: location.metaDescription,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: location.metaTitle,
      description: location.metaDescription,
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { city } = await params;
  const location = getLocationBySlug(city);
  if (!location) notFound();

  return (
    <main>
      <LocationJsonLd location={location} />
      <LocationHero
        city={location.city}
        headline={location.headline}
        tagline={location.tagline}
      />
      <section className="px-6 pb-16 md:px-8 md:pb-20">
        <div className="mx-auto max-w-3xl space-y-4 text-base leading-relaxed text-muted md:text-lg">
          {location.intro.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>
      <LocationServices city={location.city} />
      <LocationFAQ city={location.city} faqs={location.faqs} />
      <LocationCTA city={location.city} />
      <Footer />
    </main>
  );
}
