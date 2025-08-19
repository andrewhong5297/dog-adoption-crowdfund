import { NextResponse } from "next/server"

export async function GET() {
  // 307 Temporary Redirect to Farcaster hosted manifest
  return NextResponse.redirect(
    "https://api.farcaster.xyz/miniapps/hosted-manifest/0198c3e4-94b4-265d-4302-f25ff2e209fd",
    { status: 307 },
  )
}
