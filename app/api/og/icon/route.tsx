import sharp from "sharp"

export const runtime = "nodejs"

export async function GET() {
  const svg = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.95" />
          <stop offset="100%" style="stop-color:#F8FAFC;stop-opacity:0.9" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
        <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.1"/>
        </filter>
      </defs>
      
      <!-- Background with rounded corners -->
      <rect width="1024" height="1024" rx="180" ry="180" fill="url(#bgGradient)" />
      
      <!-- Decorative background circles -->
      <circle cx="200" cy="200" r="120" fill="rgba(255,255,255,0.1)" />
      <circle cx="824" cy="300" r="80" fill="rgba(255,255,255,0.08)" />
      <circle cx="150" cy="800" r="100" fill="rgba(255,255,255,0.06)" />
      
      <!-- Main icon container -->
      <rect x="192" y="192" width="640" height="640" rx="120" ry="120" fill="url(#iconBg)" filter="url(#shadow)" />
      
      <!-- Dog paw prints decoration -->
      <g fill="rgba(59,130,246,0.2)" transform="translate(280,280)">
        <circle cx="0" cy="0" r="12" />
        <circle cx="20" cy="-8" r="8" />
        <circle cx="40" cy="0" r="12" />
        <circle cx="20" cy="12" r="8" />
      </g>
      
      <g fill="rgba(139,92,246,0.2)" transform="translate(680,680)">
        <circle cx="0" cy="0" r="12" />
        <circle cx="-20" cy="-8" r="8" />
        <circle cx="-40" cy="0" r="12" />
        <circle cx="-20" cy="12" r="8" />
      </g>
      
      <!-- Heart symbol -->
      <g transform="translate(512,400)" fill="#EF4444">
        <path d="M0,20 C-20,0 -50,0 -50,30 C-50,60 0,80 0,80 C0,80 50,60 50,30 C50,0 20,0 0,20 Z" filter="url(#innerShadow)" />
      </g>
      
      <!-- Dog silhouette -->
      <g transform="translate(512,550)" fill="#374151">
        <ellipse cx="0" cy="0" rx="80" ry="40" />
        <ellipse cx="-60" cy="-20" rx="30" ry="35" />
        <ellipse cx="60" cy="-20" rx="30" ry="35" />
        <circle cx="-40" cy="-35" r="8" />
        <circle cx="40" cy="-35" r="8" />
        <ellipse cx="0" cy="-15" rx="15" ry="8" fill="#1F2937" />
      </g>
      
      <!-- Text -->
      <text x="512" y="720" textAnchor="middle" fill="#1F2937" fontFamily="Inter, sans-serif" fontSize="48" fontWeight="bold">Brooklyn ACC</text>
      <text x="512" y="770" textAnchor="middle" fill="#6B7280" fontFamily="Inter, sans-serif" fontSize="32" fontWeight="500">Dogs</text>
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
    console.error("Error generating icon:", error)
    return new Response("Error generating icon", { status: 500 })
  }
}
