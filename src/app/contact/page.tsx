import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ContactForm from "@/components/ContactForm";
import { breadcrumbs } from "@/lib/jsonld";
import { Eyebrow, Section } from "@/components/ui";
import Link from "next/link";
import { OG_IMAGE, TWITTER_CARD } from "@/lib/seo";

const TITLE = "Contact — KeepMySnaps";
const DESCRIPTION =
  "Something not working, a refund, a question the FAQ doesn't answer, or a Snapchat export shaped in a way the tool didn't expect. It goes to one person.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    siteName: "KeepMySnaps",
    title: TITLE,
    description: DESCRIPTION,
    url: "/contact",
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <Nav />
      <main>
        <Section className="pt-16 pb-14 sm:pt-24 sm:pb-16">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-4 max-w-[22ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            Ask a person
          </h1>
          <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-[1.65] text-muted-cool">
            Refunds, a file the tool choked on, a question the{" "}
            <Link
              href="/faq"
              className="font-semibold text-ink underline underline-offset-4"
            >
              FAQ
            </Link>{" "}
            doesn&rsquo;t cover. Snapchat has shipped several shapes of this
            export over the years, so if yours came out wrong, saying what you
            saw is genuinely useful.
          </p>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-[1.65] text-muted-cool">
            Don&rsquo;t send photos. Nothing here can read them, and there is
            nowhere to put them.
          </p>
        </Section>

        <Section className="pb-24 sm:pb-32">
          <ContactForm />
        </Section>
      </main>
      <Footer />
    </>
  );
}
