# Brooklyn ACC Dog Crowdfund - Deployment Guide

## Overview
This is a Farcaster miniapp for crowdfunding dog rescue efforts at Brooklyn Animal Care Centers, built using the Herd Trails API.

## Prerequisites
- Node.js 18+ 
- Vercel account
- Domain name (required for Farcaster miniapp)

## Environment Variables
Set these in your deployment environment:

\`\`\`bash
NEXT_PUBLIC_URL=https://your-domain.com
\`\`\`

## Deployment Steps

### 1. Deploy to Vercel
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
\`\`\`

### 2. Set Custom Domain
- Go to Vercel dashboard
- Add your custom domain
- Update NEXT_PUBLIC_URL environment variable

### 3. Test the Miniapp
- Visit: https://farcaster.xyz/~/developers/mini-apps/preview?url=YOUR_DOMAIN
- Verify all meta tags load correctly
- Test wallet connection and transactions

### 4. Sign the Manifest (Required)
- Go to: https://farcaster.xyz/~/developers/mini-apps/manifest
- Enter your domain URL
- Sign the manifest to verify ownership

### 5. Submit for Review
- Once tested, submit your miniapp for Farcaster review
- Ensure all functionality works on mobile

## Trail Information
- Trail ID: 0198c2e0-a2d8-76d3-bfe1-3c9191ebd378
- Version ID: 0198c2e0-a2e1-79cb-9c8f-1ea675b21ce7
- Trail App ID: 0198c2df-d48c-7f25-aae1-873d55126415

## API Endpoints
- `/api/og/image` - Main social image (1200x800)
- `/api/og/icon` - App icon (1024x1024) 
- `/api/og/splash` - Loading screen icon (200x200)
- `/api/manifest` - Dynamic manifest.json

## Features
- ✅ Farcaster wallet connection
- ✅ USDC approval and donation flow
- ✅ Refund claiming for failed campaigns
- ✅ Community activity feed
- ✅ Execution history tracking
- ✅ Real-time crowdfund progress
- ✅ Mobile-optimized UI
- ✅ Herd block explorer integration

## Support
For issues or questions:
- Trail details: [Guidebook URL](https://trails-api.herd.eco/v1/trails/0198c2e0-a2d8-76d3-bfe1-3c9191ebd378/versions/0198c2e0-a2e1-79cb-9c8f-1ea675b21ce7/guidebook.txt?promptObject=farcaster_miniapp&trailAppId=0198c2df-d48c-7f25-aae1-873d55126415)
- Contact: @andrewhong5297 (Twitter/Telegram), @ilemi (Farcaster), andrew@herd.eco
