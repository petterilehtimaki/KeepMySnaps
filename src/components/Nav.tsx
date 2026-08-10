import Link from "next/link";
import MobileMenu from "./MobileMenu";
import { ButtonLink } from "./ui";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hair/70 bg-paper/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link
            href="/"
            className="text-[1.0625rem] font-extrabold tracking-[-0.02em] text-ink"
          >
            KeepMySnaps
          </Link>
        </div>

        <div className="flex items-center gap-7">
          <Link
            href="/how-it-works"
            className="hidden text-[0.875rem] font-semibold text-muted-cool transition-colors hover:text-ink sm:block"
          >
            How it works
          </Link>
          <Link
            href="/faq"
            className="hidden text-[0.875rem] font-semibold text-muted-cool transition-colors hover:text-ink sm:block"
          >
            FAQ
          </Link>
          <ButtonLink href="/#upload" size="sm">
            Save my memories
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
