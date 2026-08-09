import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KeepMySnaps — Save your Snapchat memories before they're gone",
  description:
    "Snapchat is deleting memories over 5GB. KeepMySnaps takes the export ZIP they email you and puts the real dates, GPS and captions back into your photos — entirely in your browser. Nothing is uploaded.",
  openGraph: {
    title: "KeepMySnaps",
    description:
      "Restore the real dates, GPS and captions Snapchat strips out of your memories export. Runs in your browser. Nothing uploaded.",
    type: "website",
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
      <body>{children}</body>
    </html>
  );
}
