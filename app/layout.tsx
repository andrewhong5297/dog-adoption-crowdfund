import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Toaster } from "../components/Toaster"

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

const frameEmbed = {
  version: "next",
  imageUrl: `${baseUrl}/api/og/image`,
  button: {
    title: "Help Save Dogs",
    action: {
      type: "launch_frame",
      name: "Brooklyn ACC Dog Crowdfund",
      url: baseUrl,
      splashImageUrl: `${baseUrl}/api/og/splash`,
      splashBackgroundColor: "#3B82F6",
    },
  },
}

export const metadata: Metadata = {
  title: "Brooklyn ACC Dog Crowdfund",
  description:
    "Help save dogs at Brooklyn Animal Care Centers through community-driven crowdfunding. Donate with USDC and make a difference in dogs' lives.",
  generator: "v0.app",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Brooklyn ACC Dog Crowdfund",
    description: "Help save dogs at Brooklyn Animal Care Centers through community-driven crowdfunding",
    url: baseUrl,
    siteName: "Brooklyn ACC Dog Crowdfund",
    images: [
      {
        url: "/api/og/image",
        width: 1200,
        height: 800,
        alt: "Brooklyn ACC Dog Crowdfund",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brooklyn ACC Dog Crowdfund",
    description: "Help save dogs at Brooklyn Animal Care Centers through community-driven crowdfunding",
    images: ["/api/og/image"],
  },
  other: {
    "fc:frame": JSON.stringify(frameEmbed),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:frame" content={JSON.stringify(frameEmbed)} />

        {/* Miniapp specific meta tags */}
        <meta name="fc:frame:image:aspect_ratio" content="1.91:1" />
        <meta name="fc:frame:input:text" content="Enter donation amount" />

        {/* PWA and mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#3B82F6" />

        {/* Icons */}
        <link rel="icon" href="/api/og/icon" type="image/png" />
        <link rel="apple-touch-icon" href="/api/og/icon" />

        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {children}
        {/* Toaster component for toast notifications */}
        <Toaster />
      </body>
    </html>
  )
}
