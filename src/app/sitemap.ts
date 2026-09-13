import type { MetadataRoute } from "next";
import { ROUTES, absoluteUrl } from "@/lib/seo";
import { ARTICLES } from "@/content/articles";

/**
 * lastmod is the day a page's words last changed, never the build time.
 * Stamping every URL with the deploy date on every push teaches crawlers the
 * field is noise, and then they ignore it for the pages that really did change.
 */
const day = (isoDay: string) => new Date(`${isoDay}T00:00:00Z`);

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ROUTES.map(({ path, priority, updated }) => ({
    url: absoluteUrl(path),
    lastModified: day(updated),
    changeFrequency: "weekly" as const,
    priority,
  }));

  // Adding an article to `content/articles.ts` is the only step: the page, the
  // sitemap entry and the footer link all follow from that one list.
  const guides = ARTICLES.map((a) => ({
    url: absoluteUrl(`/${a.slug}`),
    lastModified: day(a.updated),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...fixed, ...guides];
}
