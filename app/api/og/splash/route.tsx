import sharp from "sharp"

export const runtime = "nodejs"

export async function GET() {
  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="splashBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <animateTransform id="pulse" attributeName="transform" type="scale" 
          values="1;1.1;1" dur="2s" repeatCount="indefinite" />
      </defs>
      
      <!-- Background -->
      <rect width="200" height="200" rx="40" ry="40" fill="url(#splashBg)" />
      
      <!-- Pulsing circle background -->
      <circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.2)" filter="url(#glow)">
        <animateTransform attributeName="transform" type="scale" 
          values="1;1.2;1" dur="2s" repeatCount="indefinite" />
      </circle>
      
      <!-- Main dog icon -->
      <g transform="translate(100,100)">
        <!-- Dog body -->
        <ellipse cx="0" cy="10" rx="25" ry="15" fill="#FFFFFF" />
        <!-- Dog head -->
        <circle cx="0" cy="-10" r="20" fill="#FFFFFF" />
        <!-- Ears -->
        <ellipse cx="-15" cy="-20" rx="8" ry="12" fill="#F3F4F6" />
        <ellipse cx="15" cy="-20" rx="8" ry="12" fill="#F3F4F6" />
        <!-- Eyes -->
        <circle cx="-8" cy="-12" r="3" fill="#374151" />
        <circle cx="8" cy="-12" r="3" fill="#374151" />
        <!-- Nose -->
        <ellipse cx="0" cy="-5" rx="3" ry="2" fill="#374151" />
        <!-- Tail -->
        <ellipse cx="20" cy="5" rx="4" ry="8" fill="#F3F4F6" transform="rotate(30 20 5)">
          <animateTransform attributeName="transform" type="rotate" 
            values="30 20 5;45 20 5;30 20 5" dur="1s" repeatCount="indefinite" />
        </ellipse>
        
        <!-- Heart floating above -->
        <g transform="translate(0,-35)" fill="#EF4444">
          <path d="M0,5 C-5,0 -12,0 -12,7 C-12,14 0,18 0,18 C0,18 12,14 12,7 C12,0 5,0 0,5 Z">
            <animateTransform attributeName="transform" type="translate" 
              values="0,-2;0,2;0,-2" dur="3s" repeatCount="indefinite" />
          </path>
        </g>
      </g>
      
      <!-- Loading dots -->
      <g transform="translate(100,160)" fill="#FFFFFF">
        <circle cx="-12" cy="0" r="3">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s" />
        </circle>
        <circle cx="0" cy="0" r="3">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="12" cy="0" r="3">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="1s" />
        </circle>
      </g>
    </svg>
  `

  try {
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error generating splash:", error)
    return new Response("Error generating splash", { status: 500 })
  }
}
