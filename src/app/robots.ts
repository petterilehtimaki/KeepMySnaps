import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Answer-engine crawlers are named explicitly rather than left to the
 * wildcard. Several of them read robots.txt strictly and treat an unnamed
 * agent as unlicensed, and a chunk of "how do I fix my Snapchat export"
 * traffic now starts in an assistant rather than a search box.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
