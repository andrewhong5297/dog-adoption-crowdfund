import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

  const manifest = {
    name: "Brooklyn ACC Dog Crowdfund",
    short_name: "ACC Dogs",
    description: "Help save dogs at Brooklyn Animal Care Centers through community-driven crowdfunding",
    version: "1.0.0",
    manifest_version: 2,
    icons: [
      {
        src: `${baseUrl}/api/og/icon`,
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: `${baseUrl}/api/og/splash`,
        sizes: "200x200",
        type: "image/png",
        purpose: "any",
      },
    ],
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#3B82F6",
    background_color: "#F8FAFC",
    scope: "/",
    lang: "en",
    categories: ["social", "finance", "lifestyle"],
    screenshots: [
      {
        src: `${baseUrl}/api/og/image`,
        sizes: "1200x800",
        type: "image/png",
        form_factor: "wide",
      },
    ],
    farcaster: {
      iconUrl: `${baseUrl}/api/og/icon`,
      splashImageUrl: `${baseUrl}/api/og/splash`,
      imageUrl: `${baseUrl}/api/og/image`,
    },
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
