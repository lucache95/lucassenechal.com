import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getToolBySlug, getAllToolSlugs, getAllTools } from "@/lib/data/tools";
import { JsonLd } from "@/components/tools/json-ld";
import { ToolHero } from "@/components/tools/tool-hero";
import { ToolContent } from "@/components/tools/tool-content";
import { ToolStackContext } from "@/components/tools/tool-stack-context";
import { ToolFAQ } from "@/components/tools/tool-faq";
import { ToolCTA } from "@/components/tools/tool-cta";
import { Footer } from "@/components/landing/footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const baseUrl = "https://lucassenechal.com";
  const url = `${baseUrl}/tools/${tool.slug}`;

  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const allTools = getAllTools();
  const relatedTools = tool.relatedTools
    .map((relSlug) => {
      const t = allTools.find((x) => x.slug === relSlug);
      return t ? { slug: t.slug, name: t.name } : null;
    })
    .filter(Boolean) as { slug: string; name: string }[];

  return (
    <main>
      <JsonLd tool={tool} />
      <ToolHero
        slug={tool.slug}
        name={tool.name}
        tagline={tool.tagline}
        brandColor={tool.brandColor}
      />
      <ToolContent
        name={tool.name}
        whatItIs={tool.whatItIs}
        whyIUseIt={tool.whyIUseIt}
        clientBenefits={tool.clientBenefits}
      />
      <ToolStackContext
        name={tool.name}
        howItFits={tool.howItFits}
        relatedTools={relatedTools}
      />
      <ToolFAQ name={tool.name} faqs={tool.faqs} />
      <ToolCTA />
      <Footer />
    </main>
  );
}
