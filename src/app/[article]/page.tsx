import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleView from "@/components/Article";
import { ARTICLES, ARTICLE_BY_SLUG } from "@/content/articles";
import { OG_IMAGE, TWITTER_CARD } from "@/lib/seo";

/**
 * Every explanatory page shares this route.
 *
 * `dynamicParams = false` means only the slugs listed in ARTICLES exist and
 * anything else is a real 404 — without it a catch-all at the root would
 * answer 200 for every typo on the site, which is the kind of soft-404 that
 * gets a new domain distrusted. Static segments like /faq still win over this
 * one, so nothing already routed is shadowed.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ article: a.slug }));
}

type Props = { params: Promise<{ article: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { article } = await params;
  const found = ARTICLE_BY_SLUG.get(article);
  if (!found) return {};

  return {
    title: found.title,
    description: found.description,
    alternates: { canonical: `/${found.slug}` },
    openGraph: {
      type: "article",
      siteName: "KeepMySnaps",
      title: found.title,
      description: found.description,
      url: `/${found.slug}`,
      images: [OG_IMAGE],
    },
    twitter: {
      card: TWITTER_CARD,
      title: found.title,
      description: found.description,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { article } = await params;
  const found = ARTICLE_BY_SLUG.get(article);
  if (!found) notFound();
  return <ArticleView article={found} />;
}
