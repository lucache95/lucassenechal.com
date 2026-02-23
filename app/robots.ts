import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/onboarding", "/api/"],
    },
    sitemap: "https://lucassenechal.com/sitemap.xml",
  };
}
