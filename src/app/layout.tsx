import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { OG_IMAGE, SITE_URL, TWITTER_CARD } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { siteGraph } from "@/lib/jsonld";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const TITLE = "KeepMySnaps — Save your Snapchat memories before they're gone";
const DESCRIPTION =
  "Snapchat is deleting memories over 5GB. KeepMySnaps takes the export ZIP they email you and puts the real dates, GPS and captions back into your photos — entirely in your browser. Nothing is uploaded.";
const SHARE_DESCRIPTION =
  "Restore the real dates, GPS and captions Snapchat strips out of your memories export. Runs in your browser. Nothing uploaded.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "KeepMySnaps",
    url: "/",
    title: TITLE,
    description: SHARE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: TITLE,
    description: SHARE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <JsonLd data={siteGraph()} />
        {children}
      </body>
    </html>
  );
}
