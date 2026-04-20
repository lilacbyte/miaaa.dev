import { ImageResponse } from "next/og";
import { getSiteInfo } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";

export async function GET() {
  const site = await getSiteInfo();
  const host = new URL(getSiteUrl()).host;
  const accentColor = site.embedColor || "#bf869a";
  const size = {
    width: 1200,
    height: 630
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 58px",
          background: "linear-gradient(135deg, #0f0f12 0%, #1a1821 45%, #2f2234 100%)",
          color: accentColor,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace"
        }}
      >
        <div style={{ fontSize: 26, opacity: 0.92 }}>{site.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 78, lineHeight: 1, letterSpacing: -2, fontWeight: 700 }}>{site.header}</div>
          <div style={{ fontSize: 32, opacity: 0.84 }}>{site.description}</div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.74 }}>{host}</div>
      </div>
    ),
    size
  );
}
