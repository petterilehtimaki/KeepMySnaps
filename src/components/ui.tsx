import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center rounded-[6px] font-semibold " +
  "transition-colors duration-150 select-none whitespace-nowrap";

const sizes = {
  sm: "h-9 px-4 text-[0.875rem]",
  md: "h-12 px-6 text-[0.9375rem]",
} as const;

const variants = {
  primary: "bg-blue text-white hover:bg-blue-deep",
  outline: "border border-hair text-ink hover:border-ink/25 hover:bg-faint",
} as const;

type ButtonLookProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
}: ButtonLookProps = {}) {
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
}

export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...rest
}: ButtonLookProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  ...rest
}: ButtonLookProps & ComponentProps<"button">) {
  return (
    <button
      className={`${buttonClass({ variant, size, className })} disabled:cursor-not-allowed disabled:opacity-45`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
      {children}
    </p>
  );
}

export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-6 ${className}`}>
      {children}
    </section>
  );
}
