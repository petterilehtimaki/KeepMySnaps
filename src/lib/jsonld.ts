import { DEADLINE, FREE_FILE_LIMIT, PRICE_CENTS, PRICE_CURRENCY } from "@/lib/config";
import { OG_IMAGE, SITE_URL, absoluteUrl } from "@/lib/seo";

/**
 * One `@graph` for the whole site, emitted once in the root layout.
 *
 * Everything is joined by `@id` rather than nested, so the SoftwareApplication
 * and the Organization are the same two nodes on every page instead of a fresh
 * pair per route — which is what stops a crawler reading five separate
 * publishers into one site.
 *
 * There is deliberately no FAQPage node. Google retired FAQ rich results for
 * every site in May 2026, so it buys no SERP feature, and claiming an AI
 * citation benefit for it would be a guess.
 */
const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#software`;

const DESCRIPTION =
  "Takes the export ZIP Snapchat emails you and writes the real capture dates, GPS coordinates and captions back into your photos. Runs entirely in the browser — nothing is uploaded.";

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "KeepMySnaps",
        url: SITE_URL,
        logo: absoluteUrl(OG_IMAGE.url),
        description: DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        name: "KeepMySnaps",
        url: SITE_URL,
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": APP_ID,
        name: "KeepMySnaps",
        url: SITE_URL,
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Photo metadata repair",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript. Runs client-side only.",
        description: DESCRIPTION,
        image: absoluteUrl(OG_IMAGE.url),
        publisher: { "@id": ORG_ID },
        isAccessibleForFree: true,
        featureList: [
          "Restores original capture dates to Snapchat Memories exports",
          "Writes GPS coordinates back into photo EXIF",
          "Merges Snapchat caption and sticker overlays onto the base photo",
          "Exports a CSV index of every date and coordinate",
          "Processes the ZIP in the browser with no upload and no account",
        ],
        offers: {
          "@type": "Offer",
          price: (PRICE_CENTS / 100).toFixed(2),
          priceCurrency: PRICE_CURRENCY.toUpperCase(),
          description: `One payment, any number of files. The first ${FREE_FILE_LIMIT} files are free.`,
          availability: "https://schema.org/InStock",
          url: SITE_URL,
        },
      },
    ],
  };
}

/** The deadline the countdown reads from, as a machine-readable event. */
export function deadlineEvent() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Snapchat can begin deleting Memories over 5GB",
    description:
      "Snapchat's 5GB Memories storage policy rolled out on 26 September 2025 with a 12-month grace period. 26 September 2026 is the earliest date deletion can begin; the rollout is per-account from then on.",
    startDate: new Date(DEADLINE).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: { "@type": "VirtualLocation", url: SITE_URL },
    organizer: { "@type": "Organization", name: "Snap Inc." },
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(({ name, path }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}
