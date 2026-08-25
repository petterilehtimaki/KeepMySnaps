import type { NextConfig } from "next";

/**
 * The Content-Security-Policy is the promise made enforceable.
 *
 * This site tells people their photos never leave their machine. That is true
 * of the code as written, but "we didn't write an upload" is a weaker
 * guarantee than "the browser will refuse one" — and the processing path now
 * leans on third-party packages (jszip, piexifjs, mp4box, mp4-muxer) that
 * could each reach the network if they were ever compromised upstream.
 * `connect-src 'self'` means they can't, no matter what they do.
 *
 * Everything is same-origin already — the fonts are self-hosted by next/font
 * rather than fetched from Google — so the policy costs nothing.
 *
 * `blob:` appears where the tab talks to itself: the finished ZIP is handed
 * over as an object URL, and rebaked videos are previewed the same way.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  // Nobody has any business framing a page that people drop private photos on.
  "frame-ancestors 'none'",
  "form-action 'self'",
  // Next inlines its own bootstrap, so 'unsafe-inline' is unavoidable without
  // nonces on a statically rendered page. connect-src is the directive doing
  // the load-bearing work here.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self'",
  // `blob:` here is not a loosening: a blob URL points at bytes this page
  // already created in its own memory, so it is not a route data can leave
  // by. It is included because reading back the finished ZIP — for a preview,
  // a checksum, anything — is an obvious thing to write and would otherwise
  // fail as a confusing product bug rather than an obvious policy error.
  "connect-src 'self' blob:",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  /**
   * A verified Stripe session id arrives as `?session_id=` and is the one
   * bearer token this site has. It gets stripped from the address bar on load,
   * but a Referer header would have carried it off the origin first.
   */
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    // `next dev` needs eval for its refresh runtime, so the strict policy is
    // production-only. Shipping a policy that only exists in prod is how you
    // find out about it in prod, so everything except script-src is identical.
    const value =
      process.env.NODE_ENV === "development"
        ? csp.replace("script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' 'unsafe-eval'")
        : csp;

    return [
      {
        source: "/:path*",
        headers: securityHeaders.map((h) =>
          h.key === "Content-Security-Policy" ? { ...h, value } : h,
        ),
      },
    ];
  },
};

export default nextConfig;
