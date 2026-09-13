import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink, Eyebrow, Section } from "./ui";
import Nav from "./Nav";
import Footer from "./Footer";
import JsonLd from "./JsonLd";
import { articleSchema, breadcrumbs } from "@/lib/jsonld";
import type { Article as ArticleContent } from "@/content/articles";
import SaveButton from "@/components/SaveButton";

/**
 * One shape for every explanatory page on the site.
 *
 * They all do the same job — answer a question someone typed into a search
 * box, then say what to do next — so they get the same skeleton rather than
 * ten near-identical page components drifting apart from each other.
 */

const h2 =
  "text-[clamp(1.375rem,3vw,1.875rem)] font-extrabold leading-[1.15] tracking-[-0.025em] text-balance";
const body = "text-[0.9375rem] leading-[1.7] text-muted-cool";

/**
 * Guide copy can carry internal links as `[label](/path)`. Only site-relative
 * paths match, so a stray bracket in the text can never become an outbound
 * link, and anything else renders exactly as written.
 */
const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    parts.push(
      <Link
        key={index}
        href={match[2]}
        className="font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
      >
        {match[1]}
      </Link>,
    );
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function formatDate(isoDay: string) {
  return new Date(`${isoDay}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function Article({ article }: { article: ArticleContent }) {
  return (
    <>
      <JsonLd data={articleSchema(article)} />
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: article.crumb, path: `/${article.slug}` },
        ])}
      />
      <Nav />
      <main>
        <Section className="pt-16 pb-12 sm:pt-24 sm:pb-14">
          <Eyebrow>{article.eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            {article.h1}
          </h1>
          <p className="mt-4 text-[0.8125rem] font-semibold text-muted">
            Updated{" "}
            <time dateTime={article.updated}>{formatDate(article.updated)}</time>
          </p>
          {/* The lead answers the headline without needing the rest of the
              page, because this is the paragraph that gets quoted. */}
          <p className="mt-6 max-w-[62ch] text-[1.0625rem] leading-[1.65] text-ink">
            <RichText text={article.lead} />
          </p>
        </Section>

        {article.blocks.map((block, i) => {
          if (block.kind === "h") {
            return (
              <Section key={i} className="pb-5 pt-6">
                <h2 className={h2}>{block.text}</h2>
              </Section>
            );
          }
          if (block.kind === "p") {
            return (
              <Section key={i} className="pb-5">
                <p className={`max-w-[62ch] ${body}`}>
                  <RichText text={block.text} />
                </p>
              </Section>
            );
          }
          if (block.kind === "ul") {
            return (
              <Section key={i} className="pb-5">
                <ul className="flex max-w-[64ch] flex-col gap-3">
                  {block.items.map((item, j) => (
                    <li key={j} className="relative pl-5">
                      <span className="absolute left-0 top-[0.72em] h-px w-2.5 bg-muted-cool/60" />
                      <span className={body}>
                        {item.lead && (
                          <span className="font-semibold text-ink">
                            {item.lead}{" "}
                          </span>
                        )}
                        <RichText text={item.text} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            );
          }
          if (block.kind === "qa") {
            return (
              <Section key={i} className="pb-5">
                <div className="flex flex-col gap-7">
                  {block.items.map((item) => (
                    <div key={item.q} className="max-w-[68ch]">
                      <p className="text-[1rem] font-bold tracking-[-0.015em]">
                        {item.q}
                      </p>
                      <p className={`mt-2 max-w-[62ch] ${body}`}>
                        <RichText text={item.a} />
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            );
          }
          // compare
          return (
            <Section key={i} className="pb-5">
              <div className="max-w-[70ch] overflow-x-auto rounded-[10px] border border-hair">
                <table className="w-full min-w-[34rem] text-left text-[0.9375rem]">
                  <thead>
                    <tr className="border-b border-hair bg-faint">
                      <th className="px-5 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted" />
                      <th className="px-5 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted">
                        {block.a}
                      </th>
                      <th className="px-5 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted">
                        {block.b}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => (
                      <tr key={row.label} className="border-b border-hair last:border-0">
                        <th className="px-5 py-3.5 align-top font-semibold">
                          {row.label}
                        </th>
                        <td className="px-5 py-3.5 align-top leading-[1.6] text-muted-cool">
                          {row.a}
                        </td>
                        <td className="px-5 py-3.5 align-top leading-[1.6] text-muted-cool">
                          {row.b}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          );
        })}

        <Section className="pb-24 pt-10 sm:pb-32">
          <div className="max-w-[70ch] border-t border-hair pt-10">
            <h2 className={h2}>{article.closer.title}</h2>
            <p className={`mt-5 max-w-[62ch] ${body}`}>
              <RichText text={article.closer.text} />
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SaveButton className="w-full sm:w-auto" />
              <ButtonLink
                href={article.closer.href}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {article.closer.label}
              </ButtonLink>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
