import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/seo";

/**
 * Everything answers on www.
 *
 * The canonical host is www.keepmysnaps.com and every canonical tag, og:url,
 * JSON-LD id and sitemap entry says so. Somebody typing the bare domain has to
 * land there too, or Google sees the same pages on two addresses and picks a
 * winner itself.
 *
 * This lives in code rather than in a dashboard redirect rule so it is
 * reviewable, testable and moves with the app if it is ever hosted somewhere
 * else again. One 301, path and query intact.
 */

const CANONICAL_HOST = new URL(SITE_URL).host;

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const bareDomain = host === "keepmysnaps.com";

  // What the visitor actually typed. On Workers the scheme survives on the
  // request URL; behind a proxy that rewrites it, the headers are the fallback.
  const visitor = request.headers.get("cf-visitor") ?? "";
  const forwarded = request.headers.get("x-forwarded-proto");
  const proto = request.nextUrl.protocol.replace(":", "");
  const insecure =
    (proto === "http" ||
      forwarded === "http" ||
      /"scheme"\s*:\s*"http"/.test(visitor)) &&
    (bareDomain || host === CANONICAL_HOST);

  // Previews, the workers.dev URL and localhost keep answering as themselves.
  if (!bareDomain && !insecure) return NextResponse.next();

  const url = new URL(request.url);
  url.protocol = "https:";
  if (bareDomain) url.host = CANONICAL_HOST;
  url.port = "";

  return NextResponse.redirect(url, 301);
}

export const config = {
  /**
   * Static files and the Next build output never need redirecting, and
   * skipping them keeps this off the hot path for every asset on a page.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
