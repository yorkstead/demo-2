import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAMPLE_BEFORE_1, SAMPLE_BEFORE_2 } from "../../lib/mock-data";


export const Scene1Crisis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // Pulse alert for the warning banner
  const alertBlink = Math.sin(frame * 0.25) > 0 ? 1 : 0.4;

  // Revenue counter: unrecorded rework cost ticks up
  const revenueLoss = Math.floor(
    interpolate(frame, [30, 150], [0, 850], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Card slide in
  const cardSlide = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050b14",
        backgroundImage:
          "radial-gradient(circle at 50% 30%, rgba(220, 38, 38, 0.18) 0%, rgba(5, 11, 20, 1) 70%)",
        color: "#ffffff",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "60px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Top Bar: Emergency Indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: titleSpring,
          transform: `translateY(${(1 - titleSpring) * -30}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              boxShadow: "0 0 16px #ef4444",
              opacity: alertBlink,
            }}
          />
          <span
            style={{
              color: "#f87171",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            INBOUND CRISIS • DOCK BAY 2
          </span>
        </div>
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            padding: "8px 18px",
            borderRadius: 999,
            color: "#fca5a5",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          TRAILER #SWFT-55219
        </div>
      </div>

      {/* Center Hero Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 60,
          alignItems: "center",
        }}
      >
        {/* Left: Punchy Typography */}
        <div
          style={{
            opacity: titleSpring,
            transform: `translateX(${(1 - titleSpring) * -40}px)`,
          }}
        >
          <div
            style={{
              color: "#fbbf24",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            The Cross-Dock Reality
          </div>
          <h1
            style={{
              fontSize: 54,
              fontWeight: 900,
              lineHeight: 1.15,
              margin: "0 0 24px 0",
              letterSpacing: "-0.02em",
            }}
          >
            A shifted mountain load arrives.
            <br />
            <span
              style={{
                color: "#ef4444",
                textShadow: "0 0 25px rgba(239, 68, 68, 0.4)",
              }}
            >
              Who pays for the rework?
            </span>
          </h1>
          <p
            style={{
              fontSize: 24,
              color: "#94a3b8",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 580,
            }}
          >
            Three weeks later, the broker disputes the $850 chargeback. The paper tally is lost.
            Your dock absorbs the cost.
          </p>

          {/* Dispute Metric Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 20,
              marginTop: 36,
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "16px 28px",
              borderRadius: 16,
              boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
            }}
          >
            <div>
              <div style={{ color: "#64748b", fontSize: 14, fontWeight: 700, textTransform: "uppercase" }}>
                Unbilled Dock Loss
              </div>
              <div style={{ color: "#ef4444", fontSize: 36, fontWeight: 900, fontFamily: "monospace" }}>
                -${revenueLoss}
              </div>
            </div>
            <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.1)" }} />
            <div>
              <div style={{ color: "#64748b", fontSize: 14, fontWeight: 700, textTransform: "uppercase" }}>
                Broker Outcome
              </div>
              <div style={{ color: "#fca5a5", fontSize: 20, fontWeight: 800 }}>
                Disputed & Unpaid
              </div>
            </div>
          </div>
        </div>

        {/* Right: Trailer Evidence Graphic */}
        <div
          style={{
            opacity: Math.max(0, cardSlide),
            transform: `scale(${0.9 + cardSlide * 0.1}) translateY(${(1 - cardSlide) * 30}px)`,
            position: "relative",
          }}
        >
          <div
            style={{
              background: "rgba(15, 34, 56, 0.75)",
              border: "2px solid rgba(239, 68, 68, 0.5)",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(239, 68, 68, 0.15), 0 10px 25px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                padding: "12px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fca5a5", letterSpacing: "0.08em" }}>
                INBOUND DAMAGE REPORT
              </span>
              <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>
                CRITICAL LEAN DETECTED
              </span>
            </div>

            {/* Embedded Realistic Evidence Inspection (Wide + Close-up) */}
            <div style={{ position: "relative", height: 350, width: "100%", overflow: "hidden" }}>
              <img
                src={SAMPLE_BEFORE_1}
                alt="Shifted Cargo Wide Trailer Interior"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Close-Up Inset: Busted Pallet Runner */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 144,
                  height: 96,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "2px solid #ef4444",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.75)",
                  background: "#000",
                }}
              >
                <img
                  src={SAMPLE_BEFORE_2}
                  alt="Busted Pallet Runner Close-Up"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(185, 28, 28, 0.9)",
                    color: "#ffffff",
                    fontSize: 9,
                    fontWeight: 900,
                    textAlign: "center",
                    letterSpacing: "0.05em",
                    padding: "2px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Busted Runner
                </div>
              </div>

              {/* Bottom Tag Bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 14,
                  right: 14,
                  background: "rgba(11, 19, 32, 0.92)",
                  border: "1px solid rgba(245, 158, 11, 0.5)",
                  padding: "9px 14px",
                  borderRadius: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backdropFilter: "blur(6px)",
                }}
              >
                <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>
                  SWFT-55219 • Inbound Mountain Shift • Denver MT Stamped
                </div>
                <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>
                  Bay 2 Held
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Callout */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: Math.max(0, titleSpring),
        }}
      >
        <span style={{ color: "#64748b", fontSize: 18, fontWeight: 600, letterSpacing: "0.05em" }}>
          Denver Express Warehousing & Cross-Docking • Operational Case Study
        </span>
      </div>
    </AbsoluteFill>
  );
};
