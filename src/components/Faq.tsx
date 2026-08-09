import FaqList from "./FaqList";
import { ButtonLink, Eyebrow, Section } from "./ui";
import { HOMEPAGE_FAQS } from "@/content/faq";

export default function Faq() {
  return (
    <Section id="faq" className="pb-24 sm:pb-32">
      <Eyebrow>FAQ</Eyebrow>
      <h2 className="mt-4 max-w-[24ch] text-[clamp(1.5rem,3.2vw,2.125rem)] font-extrabold leading-[1.15] tracking-[-0.025em] text-balance">
        Questions people actually ask
      </h2>

      <div className="mt-12">
        <FaqList items={HOMEPAGE_FAQS} />
      </div>

      <div className="mt-12">
        <ButtonLink href="/faq" variant="outline">
          The other seven, with the bits we trimmed out of these
        </ButtonLink>
      </div>
    </Section>
  );
}
