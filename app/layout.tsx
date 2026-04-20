import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import { getSiteHost, getSiteUrl } from "@/lib/site";
import "./globals.css";

const pixelHeader = Press_Start_2P({
  variable: "--font-pixel-header",
  subsets: ["latin"],
  weight: "400"
});

const terminalBody = VT323({
  variable: "--font-terminal-body",
  subsets: ["latin"],
  weight: "400"
});

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const siteHost = getSiteHost();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteHost} | lilacbyte`,
      template: `%s | ${siteHost}`
    },
    description:
      "Retro landing page for lilacbyte: Java and Luanti modding projects, social links, and active open-source work.",
    applicationName: siteHost,
    keywords: [
      "lilacbyte",
      siteHost,
      "java modding",
      "luanti modding",
      "minetest mods",
      "open source projects",
      "retro portfolio"
    ],
    alternates: {
      canonical: "/"
    },
    authors: [{ name: "Mia" }],
    creator: "Mia",
    publisher: "Mia",
    category: "technology",
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      siteName: siteHost,
      title: `${siteHost} | lilacbyte`,
      description:
        "Retro landing page for lilacbyte with current Java and Luanti modding projects and links."
    },
    twitter: {
      card: "summary",
      title: `${siteHost} | lilacbyte`,
      description:
        "Retro landing page for lilacbyte with current Java and Luanti modding projects and links."
    },
    formatDetection: {
      email: true,
      address: false,
      telephone: false
    }
  };
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css/strapless.min.css" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.2.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${pixelHeader.variable} ${terminalBody.variable}`}>{children}</body>
    </html>
  );
}
