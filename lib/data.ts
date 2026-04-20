import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

export type Project = {
  name: string;
  url: string;
  description: string;
  period: string;
  active?: boolean;
  featured?: boolean;
  tags?: string[];
};

export type SocialLink = {
  label: string;
  url?: string;
  handle?: string;
};

export type SiteInfo = {
  title: string;
  description: string;
  embedColor: string;
  header: string;
  about: string;
  refreshSeconds: number;
  experienced: SiteItem[];
  interests: SiteItem[];
  ecperienced?: SiteItem[];
};

export type MediaFiles = {
  musicFiles: string[];
  photoFiles: string[];
};

export type SiteItem = {
  name: string;
  icon?: string;
};

async function readJsonFile<T>(filename: string): Promise<T> {
  noStore();

  const filePath = path.join(process.cwd(), "data", filename);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return [] as T;
  }
}

function isProject(item: unknown): item is Project {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Partial<Project>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.url === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.period === "string"
  );
}

function isSocialLink(item: unknown): item is SocialLink {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Partial<SocialLink>;
  if (typeof candidate.label !== "string") {
    return false;
  }

  return typeof candidate.url === "undefined" || typeof candidate.url === "string";
}

function isSiteInfo(item: unknown): item is SiteInfo {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Partial<SiteInfo>;
  const hasExperienced =
    Array.isArray(candidate.experienced) && candidate.experienced.every(isSiteItemLike);
  const hasEcperienced =
    Array.isArray(candidate.ecperienced) && candidate.ecperienced.every(isSiteItemLike);

  return (
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.embedColor === "string" &&
    typeof candidate.header === "string" &&
    typeof candidate.about === "string" &&
    typeof candidate.refreshSeconds === "number" &&
    (hasExperienced || hasEcperienced) &&
    Array.isArray(candidate.interests) &&
    candidate.interests.every(isSiteItemLike)
  );
}

function isSiteItemLike(item: unknown): boolean {
  if (typeof item === "string") {
    return true;
  }

  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Partial<SiteItem>;
  return (
    typeof candidate.name === "string" &&
    (typeof candidate.icon === "undefined" || typeof candidate.icon === "string")
  );
}

function normalizeSiteItem(item: string | SiteItem): SiteItem {
  if (typeof item === "string") {
    return { name: item };
  }

  return {
    name: item.name,
    icon: item.icon
  };
}

export async function getProjects(): Promise<Project[]> {
  const data = await readJsonFile<unknown>("projects.json");
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isProject);
}

export async function getLinks(): Promise<SocialLink[]> {
  const data = await readJsonFile<unknown>("links.json");
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isSocialLink);
}

export async function getSiteInfo(): Promise<SiteInfo> {
  const fallback: SiteInfo = {
    title: "miaaa.dev | lilacbyte",
    description:
      "Retro landing page for lilacbyte: Java and Luanti modding projects, social links, and active open-source work.",
    embedColor: "#bf869a",
    header: "hi, i am mia!",
    about:
      "i go by mia / lilacbyte. i build and mod things online, and right now my main focus is Java and Luanti modding.",
    refreshSeconds: 120,
    experienced: [
      { name: "linux", icon: "fa-brands fa-linux" },
      { name: "bash", icon: "fa-solid fa-terminal" },
      { name: "git", icon: "fa-brands fa-git-alt" },
      { name: "docker", icon: "fa-brands fa-docker" },
      { name: "java", icon: "fa-brands fa-java" },
      { name: "javascript", icon: "fa-brands fa-js" },
      { name: "nodejs", icon: "fa-brands fa-node-js" }
    ],
    interests: [
      { name: "reading", icon: "fa-solid fa-book" },
      { name: "writing", icon: "fa-solid fa-pencil" },
      { name: "programming", icon: "fa-solid fa-code" },
      { name: "minecraft", icon: "fa-solid fa-cube" },
      { name: "opensource", icon: "fa-brands fa-osi" }
    ]
  };

  const data = await readJsonFile<unknown>("site.json");
  if (!isSiteInfo(data)) {
    return fallback;
  }

  return {
    ...data,
    experienced: (data.experienced ?? data.ecperienced ?? fallback.experienced).map(normalizeSiteItem),
    interests: data.interests.map(normalizeSiteItem)
  };
}

async function readPublicDirFiles(dirName: string, extensions: string[]): Promise<string[]> {
  noStore();

  const dirPath = path.join(process.cwd(), "public", dirName);
  const allowed = new Set(extensions.map((ext) => ext.toLowerCase()));

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return allowed.has(ext);
      })
      .sort((a, b) => a.localeCompare(b))
      .map((name) => `/${dirName}/${name}`);
  } catch {
    return [];
  }
}

export async function getMediaFiles(): Promise<MediaFiles> {
  const [musicFiles, photoFiles] = await Promise.all([
    readPublicDirFiles("mus", [".mp3", ".wav", ".ogg", ".m4a", ".flac"]),
    readPublicDirFiles("img", [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"])
  ]);

  return {
    musicFiles,
    photoFiles
  };
}
