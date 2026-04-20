function normalizeBaseUrl(input: string): URL {
  const value = input.trim();
  if (!value) {
    return new URL("http://localhost");
  }

  if (/^https?:\/\//i.test(value)) {
    return new URL(value);
  }

  const protocol =
    value === "localhost" || value.startsWith("localhost:") || value.startsWith("127.0.0.1")
      ? "http"
      : "https";

  return new URL(`${protocol}://${value}`);
}

function readEnvValue(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

export function getSiteUrl(): string {
  const rawUrl = readEnvValue("url", "URL", "site_url", "SITE_URL") ?? "http://localhost";
  const rawPort = (readEnvValue("port", "PORT", "site_port", "SITE_PORT") ?? "3000").trim();

  const parsed = normalizeBaseUrl(rawUrl);
  if (rawPort) {
    parsed.port = rawPort;
  }

  return parsed.toString().replace(/\/$/, "");
}

export function getSiteHost(): string {
  return new URL(getSiteUrl()).host;
}
