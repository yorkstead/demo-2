import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const badgeSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15 },
  });

  const glowPulse = Math.sin(frame * 0.15) * 0.4 + 0.6;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060d17",
        backgroundImage:
          "radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.18) 0%, rgba(6, 13, 23, 1) 75%)",
        color: "#ffffff",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "60px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Top Client Badge */}
      <div
        style={{
          opacity: entrance,
          transform: `translateY(${(1 - entrance) * -20}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(212, 175, 55, 0.12)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            borderRadius: 999,
            padding: "8px 24px",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "#d4af37", fontWeight: 800, fontSize: 15, letterSpacing: "0.12em" }}>
            TAILORED FOR DENVER EXPRESS WAREHOUSING & CROSS-DOCKING
          </span>
        </div>
      </div>

      {/* Main Closing Proposition */}
      <div
        style={{
          maxWidth: 1050,
          opacity: entrance,
          transform: `scale(${0.95 + entrance * 0.05})`,
        }}
      >
        <h1
          style={{
            fontSize: 66,
            fontWeight: 900,
            lineHeight: 1.15,
            margin: "0 0 24px 0",
            letterSpacing: "-0.03em",
          }}
        >
          Stop absorbing re-stack charges.
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #d4af37 0%, #fef08a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Capture every dollar in real time.
          </span>
        </h1>

        <p
          style={{
            fontSize: 26,
            color: "#94a3b8",
            lineHeight: 1.5,
            margin: "0 auto 36px auto",
            maxWidth: 820,
          }}
        >
          Put Steve Chapman, Dale Burget, and the dock team in complete control with instant evidence,
          digital driver sign-off, and one-tap QuickBooks billing.
        </p>

        {/* Big Live URL Action Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 24,
            background: "rgba(15, 34, 56, 0.9)",
            border: "2px solid rgba(212, 175, 55, 0.6)",
            padding: "20px 40px",
            borderRadius: 24,
            boxShadow: `0 0 ${40 * glowPulse}px rgba(212, 175, 55, 0.25)`,
            opacity: Math.max(0, badgeSpring),
            transform: `translateY(${(1 - badgeSpring) * 20}px)`,
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, color: "#d4af37", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Experience The Live Two-Device Demo
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.01em" }}>
              rework-flow.vercel.app
            </div>
          </div>
          <div
            style={{
              background: "#d4af37",
              color: "#060d17",
              fontWeight: 900,
              fontSize: 16,
              padding: "12px 24px",
              borderRadius: 14,
              letterSpacing: "0.05em",
            }}
          >
            TEST LIVE
          </div>
        </div>
      </div>

      {/* Footer System Credits */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 1200,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 24,
          opacity: Math.max(0, badgeSpring),
          color: "#64748b",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        <div>Architected by <span style={{ color: "#e2e8f0", fontWeight: 700 }}>Yorkstead Systems</span></div>
        <div>6030 Washington St, Denver, CO • Bay 2 Proven</div>
        <div>Deployment Ready on Vercel</div>
      </div>
    </AbsoluteFill>
  );
};
