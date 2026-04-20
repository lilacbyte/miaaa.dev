import type { Metadata, Viewport } from "next";
import { getLinks, getMediaFiles, getProjects, getSiteInfo } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";
import { RetroLanding } from "@/app/components/retro-landing";

export const dynamic = "force-dynamic";

function safeJsonForScriptTag(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteInfo();

  return {
    title: {
      absolute: site.title
    },
    description: site.description,
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title: site.title,
      description: site.description,
      url: "/",
      type: "website",
      images: [
        {
          url: "/og"
        }
      ]
    },
    twitter: {
      title: site.title,
      description: site.description,
      card: "summary_large_image",
      images: ["/og"]
    }
  };
}

export async function generateViewport(): Promise<Viewport> {
  const site = await getSiteInfo();
  return {
    themeColor: site.embedColor
  };
}

export default async function Home() {
  const siteUrl = getSiteUrl();
  const [projects, links, site, media] = await Promise.all([
    getProjects(),
    getLinks(),
    getSiteInfo(),
    getMediaFiles()
  ]);
  const sameAs = links
    .map((link) => link.url)
    .filter((url): url is string => typeof url === "string" && url.startsWith("http"));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mia",
    alternateName: "lilacbyte",
    url: siteUrl,
    description: site.description,
    knowsAbout: ["Java", "Luanti", "Lua", "Modding", "Open Source"],
    sameAs,
    mainEntityOfPage: siteUrl,
    hasPart: projects.slice(0, 20).map((project) => ({
      "@type": "SoftwareSourceCode",
      name: project.name,
      codeRepository: project.url,
      description: project.description
    }))
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonForScriptTag(jsonLd) }}
      />
      <RetroLanding
        projects={projects}
        links={links}
        site={site}
        musicFiles={media.musicFiles}
        photoFiles={media.photoFiles}
      />
    </main>
  );
}
