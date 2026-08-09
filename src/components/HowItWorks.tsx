import { ButtonLink, Eyebrow, Section } from "./ui";
import { STEPS } from "@/content/steps";

export default function HowItWorks() {
  return (
    <Section id="how-it-works" className="pb-24 sm:pb-32">
      <Eyebrow>How it works</Eyebrow>
      <h2 className="mt-4 max-w-[24ch] text-[clamp(1.5rem,3.2vw,2.125rem)] font-extrabold leading-[1.15] tracking-[-0.025em] text-balance">
        Three steps, one of which is just waiting for Snapchat
      </h2>

      <ol className="mt-14 grid grid-cols-1 gap-x-14 gap-y-12 md:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.n} className="max-w-[38ch]">
            <span className="tnum block text-[1.375rem] font-extrabold tracking-[-0.02em] text-colon">
              {step.n}
            </span>
            <h3 className="mt-4 text-[1.0625rem] font-bold tracking-[-0.015em]">
              {step.title}
            </h3>
            <p className="mt-2.5 text-[0.9375rem] leading-[1.65] text-muted-cool">
              {step.short}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-14">
        <ButtonLink href="/how-it-works" variant="outline">
          The longer version, in case we glossed over your bit
        </ButtonLink>
      </div>
    </Section>
  );
}
