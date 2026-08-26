import type { MetadataRoute } from "next";
import { ROUTES, absoluteUrl } from "@/lib/seo";
import { ARTICLES } from "@/content/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const fixed = ROUTES.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "weekly" as const,
    priority,
  }));

  // Adding an article to `content/articles.ts` is the only step: the page, the
  // sitemap entry and the footer link all follow from that one list.
  const guides = ARTICLES.map((a) => ({
    url: absoluteUrl(`/${a.slug}`),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...fixed, ...guides];
}
