import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAMPLE_BEFORE_1, SAMPLE_BEFORE_2, SAMPLE_AFTER, SAMPLE_SIGNATURE } from "../../lib/mock-data";


export const Scene4OfficeSync: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14 },
  });

  // Chime soundwave burst at frame 15
  const chimePulse = Math.max(0, Math.sin((frame - 15) * 0.15)) * (frame < 80 ? 1 : 0);

  // Certificate modal pop-up at frame 120
  const modalSpring = spring({
    frame: frame - 100,
    fps,
    config: { damping: 15 },
  });

  // Export button click at frame 260
  const isExported = frame >= 260;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060d17",
        backgroundImage:
          "radial-gradient(circle at 65% 45%, rgba(16, 185, 129, 0.15) 0%, rgba(6, 13, 23, 1) 70%)",
        color: "#ffffff",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "40px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Top Office Header with Audio Chime Notification */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: entrance,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: 999,
              padding: "6px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>🔔</span>
            <span style={{ color: "#34d399", fontWeight: 800, fontSize: 14, letterSpacing: "0.08em" }}>
              AUDIO CHIME SYNTHESIZED • REAL-TIME DISPATCH DETECTED
            </span>
          </div>
          <div style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace" }}>
            LATENCY: 1.2s • WEBSOCKET/POLL
          </div>
        </div>

        <div style={{ fontSize: 15, color: "#94a3b8", fontWeight: 700 }}>
          DENVER EXPRESS WAREHOUSING • DISPATCH BOARD
        </div>
      </div>

      {/* Main Dashboard Preview & Certificate Modal */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr",
          gap: 50,
          alignItems: "center",
          height: "100%",
          padding: "20px 0",
        }}
      >
        {/* Left Side: Pitch Commentary */}
        <div>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            STEP 2 • IN THE OFFICE
          </div>

          <h2 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.15, margin: "0 0 20px 0" }}>
            The office hears the chime.
            <br />
            <span style={{ color: "#34d399" }}>Invoice is ready instantly.</span>
          </h2>

          <p style={{ fontSize: 22, color: "#94a3b8", lineHeight: 1.5, margin: "0 0 30px 0" }}>
            No handwritten clipboards at 5:00 PM. No waiting for driver copies.
            The official Certificate of Evidence with before & after photos is already rendered.
          </p>

          {/* Quick Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div
              style={{
                background: "rgba(15, 34, 56, 0.7)",
                border: "1px solid #233f63",
                borderRadius: 16,
                padding: "16px 20px",
              }}
            >
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                Total Job Value
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#34d399", marginTop: 4 }}>
                $455.00
              </div>
              <div style={{ fontSize: 12, color: "#38bdf8", marginTop: 4 }}>Swift Transportation</div>
            </div>

            <div
              style={{
                background: "rgba(15, 34, 56, 0.7)",
                border: "1px solid #233f63",
                borderRadius: 16,
                padding: "16px 20px",
              }}
            >
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                Billing Velocity
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", marginTop: 4 }}>
                0 Days
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Same-day settlement</div>
            </div>
          </div>
        </div>

        {/* Right Side: Rendered Certificate of Evidence */}
        <div
          style={{
            position: "relative",
            opacity: Math.max(0, modalSpring),
            transform: `scale(${0.9 + modalSpring * 0.1})`,
          }}
        >
          {/* Certificate Card */}
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: 20,
              padding: "24px 30px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.7), 0 0 30px rgba(16, 185, 129, 0.2)",
              border: "2px solid #e2e8f0",
            }}
          >
            {/* Certificate Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "2px solid #0f172a",
                paddingBottom: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
                  DENVER EXPRESS WAREHOUSING
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  6030 Washington St, Denver, CO • DOT #2481902
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    background: "#ecfdf5",
                    color: "#047857",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #a7f3d0",
                  }}
                >
                  AUDIT CERTIFICATE #RW-0842
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  Trailer SWFT-55219 • Bay 2
                </div>
              </div>
            </div>

            {/* Side-by-side Photo Comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div style={{ border: "1px solid #cbd5e1", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", display: "flex", justifyContent: "space-between" }}>
                  <span>BEFORE: INBOUND SHIFT</span>
                  <span style={{ fontSize: 9, opacity: 0.9 }}>WIDE + BUSTED RUNNER</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: 110 }}>
                  <img src={SAMPLE_BEFORE_1} alt="Before Wide Truck" style={{ width: "100%", height: 110, objectFit: "cover", borderRight: "1px solid #e2e8f0" }} />
                  <img src={SAMPLE_BEFORE_2} alt="Before Busted Runner" style={{ width: "100%", height: 110, objectFit: "cover" }} />
                </div>
              </div>
              <div style={{ border: "1px solid #cbd5e1", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: "#10b981", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px" }}>
                  AFTER: ROAD READY & REBANDED
                </div>
                <img src={SAMPLE_AFTER} alt="After Rework" style={{ width: "100%", height: 110, objectFit: "cover" }} />
              </div>
            </div>

            {/* Itemized Bill Strip */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                fontSize: 12,
              }}
            >
              <div>4 Pallets ($112) • 2 Wrap ($70) • 1.25h Labor ($138) • Scale ($135)</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>$455.00</div>
            </div>

            {/* Signed Footer Strip & QuickBooks Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src={SAMPLE_SIGNATURE} alt="Sig" style={{ height: 32, objectFit: "contain" }} />
                <span style={{ fontSize: 11, color: "#64748b" }}>Driver Sign: Marcus Vance</span>
              </div>

              <div
                style={{
                  background: isExported ? "#166534" : "#0284c7",
                  color: "#ffffff",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <span>{isExported ? "✓ EXPORTED TO QUICKBOOKS" : "📥 EXPORT QUICKBOOKS CSV"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Callout */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#34d399", fontSize: 18, fontWeight: 700 }}>
          Billed and dispatched before the driver pulls past the guard shack.
        </span>
      </div>
    </AbsoluteFill>
  );
};
