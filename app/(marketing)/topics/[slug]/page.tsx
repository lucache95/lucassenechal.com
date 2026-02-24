import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getTopicBySlug,
  getAllTopicSlugs,
  getAllTopicPages,
} from '@/lib/data/topic-pages';
import { TopicJsonLd } from '@/components/topics/topic-json-ld';
import { TopicHero } from '@/components/topics/topic-hero';
import { TopicContent } from '@/components/topics/topic-content';
import { TopicFAQ } from '@/components/topics/topic-faq';
import { TopicCTA } from '@/components/topics/topic-cta';
import { Footer } from '@/components/landing/footer';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return {};

  const baseUrl = 'https://lucassenechal.com';
  const url = `${baseUrl}/topics/${topic.slug}`;

  return {
    title: topic.metaTitle,
    description: topic.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: topic.metaTitle,
      description: topic.metaDescription,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: topic.metaTitle,
      description: topic.metaDescription,
    },
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  return (
    <main>
      <TopicJsonLd topic={topic} />
      <TopicHero icon={topic.icon} title={topic.title} tagline={topic.tagline} />
      <TopicContent
        title={topic.title}
        briefingIntro={topic.briefingIntro}
        sampleBriefing={topic.sampleBriefing}
        sources={topic.sources}
      />
      <TopicFAQ title={topic.title} faqs={topic.faqs} />
      <TopicCTA />
      <Footer />
    </main>
  );
}
