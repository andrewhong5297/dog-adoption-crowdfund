import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "800px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)",
        color: "white",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          right: "-150px",
          width: "500px",
          height: "500px",
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 1,
          padding: "40px",
        }}
      >
        {/* Dog icon */}
        <div
          style={{
            width: "120px",
            height: "120px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "30px",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <div style={{ fontSize: "60px" }}>🐕</div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "16px",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          Brooklyn ACC Dogs
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            marginBottom: "20px",
            opacity: 0.9,
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          Crowdfund Campaign
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "18px",
            opacity: 0.8,
            maxWidth: "600px",
            lineHeight: 1.4,
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
          }}
        >
          Help save dogs in need at Brooklyn Animal Care Centers through our community-driven crowdfunding platform
        </div>

        {/* Call to action */}
        <div
          style={{
            marginTop: "30px",
            padding: "12px 24px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "25px",
            fontSize: "16px",
            fontWeight: "600",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          💝 Donate with USDC • Powered by Herd
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 800,
    },
  )
}
