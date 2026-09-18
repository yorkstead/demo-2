import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene2Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const devicesSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 16 },
  });

  const pulseBeam = Math.sin(frame * 0.2) * 0.5 + 0.5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060d17",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.12) 0%, rgba(6, 13, 23, 1) 75%)",
        color: "#ffffff",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "50px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Top Yorkstead Systems Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: entrance,
          transform: `translateY(${(1 - entrance) * -20}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(212, 175, 55, 0.12)",
            border: "1px solid rgba(212, 175, 55, 0.35)",
            padding: "8px 24px",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#d4af37",
              boxShadow: "0 0 10px #d4af37",
            }}
          />
          <span
            style={{
              color: "#d4af37",
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            YORKSTEAD SYSTEMS PRESENTS
          </span>
        </div>
      </div>

      {/* Main Branding Header */}
      <div
        style={{
          textAlign: "center",
          opacity: entrance,
          transform: `scale(${0.95 + entrance * 0.05})`,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 900,
            margin: "0 0 14px 0",
            letterSpacing: "-0.03em",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span>Rework</span>
          <span
            style={{
              background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Flow
          </span>
        </h1>
        <p
          style={{
            fontSize: 26,
            color: "#94a3b8",
            margin: 0,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          The <span style={{ color: "#d4af37", fontWeight: 800 }}>Two-Device</span> Cross-Dock Operating System
        </p>
      </div>

      {/* The Two Devices Presentation */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 30,
          maxWidth: 1400,
          margin: "0 auto",
          width: "100%",
          opacity: Math.max(0, devicesSpring),
          transform: `translateY(${(1 - devicesSpring) * 40}px)`,
        }}
      >
        {/* Left Device: Smartphone (The Dock) */}
        <div
          style={{
            background: "rgba(15, 34, 56, 0.8)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: 24,
            padding: "28px 32px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            DEVICE 1 • ON THE DOCK
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 10px 0" }}>
            Smartphone (/dock)
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 16, margin: "0 0 20px 0", lineHeight: 1.4 }}>
            Built for forklift operators with work gloves, glare, and loud engines.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "#cbd5e1" }}>
            <div>✓ Huge touch counters (+ / -)</div>
            <div>✓ Tamper-proof GPS & MT time stamp</div>
            <div>✓ Driver signature right on glass</div>
          </div>
        </div>

        {/* Center Live Sync Beam */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "0 20px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#34d399",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            REAL-TIME SYNC
          </div>
          <div
            style={{
              width: 120,
              height: 4,
              background: "linear-gradient(90deg, #38bdf8, #34d399)",
              boxShadow: `0 0 ${15 * pulseBeam}px #34d399`,
              borderRadius: 2,
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              fontFamily: "monospace",
            }}
          >
            1.5s POLLING LATENCY
          </div>
        </div>

        {/* Right Device: Laptop (The Office) */}
        <div
          style={{
            background: "rgba(15, 34, 56, 0.8)",
            border: "1px solid rgba(52, 211, 153, 0.3)",
            borderRadius: 24,
            padding: "28px 32px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(52, 211, 153, 0.15)",
              color: "#34d399",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            DEVICE 2 • IN THE OFFICE
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 10px 0" }}>
            Laptop (/office)
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 16, margin: "0 0 20px 0", lineHeight: 1.4 }}>
            For dispatchers, billing managers, and dock superintendents.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "#cbd5e1" }}>
            <div>✓ Auto-playing audio chime on dispatch</div>
            <div>✓ Instant branded Evidence Certificate PDF</div>
            <div>✓ One-click QuickBooks / Xero CSV export</div>
          </div>
        </div>
      </div>

      {/* Footer Feature Badges */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          opacity: Math.max(0, devicesSpring),
        }}
      >
        <span style={{ color: "#64748b", fontSize: 16, fontWeight: 700 }}>
          ⚡ Zero App Store Installs • Runs in Any Mobile Browser
        </span>
        <span style={{ color: "#64748b", fontSize: 16, fontWeight: 700 }}>
          🔒 Unforgeable Legal Proof
        </span>
        <span style={{ color: "#64748b", fontSize: 16, fontWeight: 700 }}>
          ⏱️ Tested at 6030 Washington St, Denver
        </span>
      </div>
    </AbsoluteFill>
  );
};
