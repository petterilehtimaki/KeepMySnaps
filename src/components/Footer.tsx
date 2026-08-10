import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-hair">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[52ch]">
          <p className="text-[0.9375rem] font-extrabold tracking-[-0.02em]">
            KeepMySnaps
          </p>
          <p className="mt-2 text-[0.8125rem] leading-[1.6] text-muted-cool">
            Not affiliated with Snapchat, Snap Inc., or whatever they&rsquo;re
            calling themselves by the time you read this.
          </p>
        </div>

        <nav className="flex items-center gap-7">
          <Link
            href="/how-it-works"
            className="text-[0.8125rem] font-semibold text-muted-cool transition-colors hover:text-ink"
          >
            How it works
          </Link>
          <Link
            href="/faq"
            className="text-[0.8125rem] font-semibold text-muted-cool transition-colors hover:text-ink"
          >
            FAQ
          </Link>
          <Link
            href="/#upload"
            className="text-[0.8125rem] font-semibold text-muted-cool transition-colors hover:text-ink"
          >
            Upload
          </Link>
        </nav>
      </div>
    </footer>
  );
}
