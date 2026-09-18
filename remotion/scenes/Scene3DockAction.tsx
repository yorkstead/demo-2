import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAMPLE_SIGNATURE } from "../../lib/mock-data";

export const Scene3DockAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  // Animated counters over time
  const pallets = Math.min(4, Math.floor(interpolate(frame, [30, 120], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const wrap = Math.min(2, Math.floor(interpolate(frame, [90, 180], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const labor = (interpolate(frame, [140, 240], [0, 1.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })).toFixed(2);

  // Dynamic total
  const total = Math.floor(pallets * 28 + wrap * 35 + parseFloat(labor) * 110);

  // Signature reveal
  const signatureProgress = interpolate(frame, [250, 360], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dispatch button press at frame 380
  const isDispatching = frame >= 380;
  const dispatchButtonScale = frame >= 380 && frame <= 400 ? 0.94 : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060d17",
        backgroundImage:
          "radial-gradient(circle at 35% 50%, rgba(14, 165, 233, 0.15) 0%, rgba(6, 13, 23, 1) 70%)",
        color: "#ffffff",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "40px 80px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        gap: 60,
      }}
    >
      {/* Left: Smartphone Container */}
      <div
        style={{
          width: 440,
          height: 820,
          backgroundColor: "#0b192c",
          border: "4px solid #1e3a5f",
          borderRadius: 44,
          padding: "20px 20px 24px 20px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(14, 165, 233, 0.2)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          opacity: entrance,
          transform: `scale(${0.9 + entrance * 0.1})`,
        }}
      >
        {/* Phone Notch & Header */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              color: "#94a3b8",
              marginBottom: 16,
              padding: "0 8px",
            }}
          >
            <span style={{ fontWeight: 700 }}>9:41 AM • Bay 2</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ color: "#34d399", fontWeight: 800 }}>● 5G DOCK</span>
              <span style={{ background: "#22c55e", width: 18, height: 10, borderRadius: 2 }} />
            </div>
          </div>

          <div
            style={{
              background: "#162b45",
              border: "1px solid #233f63",
              borderRadius: 16,
              padding: "12px 16px",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#38bdf8", fontWeight: 800 }}>TRAILER INTAKE</span>
              <span style={{ fontSize: 11, background: "#0284c7", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                BAY 2 ACTIVE
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>SWFT-55219</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Swift Transportation • Driver: M. Vance</div>
          </div>

          {/* Big Touch Supplies Counters */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Pallets Counter */}
            <div
              style={{
                background: "#0f2238",
                border: "1px solid #233f63",
                borderRadius: 14,
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>GMA Pallets ($28/ea)</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Grade-A Heat Treated</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1e3a5f", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 18, fontWeight: 900 }}>
                  -
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, minWidth: 28, textAlign: "center", color: "#38bdf8" }}>
                  {pallets}
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#0284c7", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 18, fontWeight: 900 }}>
                  +
                </div>
              </div>
            </div>

            {/* Shrink Wrap Counter */}
            <div
              style={{
                background: "#0f2238",
                border: "1px solid #233f63",
                borderRadius: 14,
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Shrink Wrap Rolls ($35/ea)</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>80-Gauge Industrial Banding</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1e3a5f", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 18, fontWeight: 900 }}>
                  -
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, minWidth: 28, textAlign: "center", color: "#38bdf8" }}>
                  {wrap}
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#0284c7", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 18, fontWeight: 900 }}>
                  +
                </div>
              </div>
            </div>

            {/* Labor Hours Counter */}
            <div
              style={{
                background: "#0f2238",
                border: "1px solid #233f63",
                borderRadius: 14,
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Dock Labor ($110/hr)</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Restack & Reband Time</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>
                {labor}h
              </div>
            </div>
          </div>

          {/* GPS Stamp */}
          <div
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: 10,
              padding: "8px 12px",
              marginTop: 12,
              fontSize: 11,
              color: "#34d399",
              fontFamily: "monospace",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>GPS: 39.8058°N, 104.9877°W</span>
            <span>DENVER EXPRESS BAY 2</span>
          </div>

          {/* Driver Signature Pad */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 12,
              padding: "10px",
              marginTop: 12,
              color: "#0f172a",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
              Driver Glass Signature (Marcus Vance)
            </div>
            <div style={{ height: 64, position: "relative", overflow: "hidden" }}>
              <img
                src={SAMPLE_SIGNATURE}
                alt="Signature"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  opacity: signatureProgress,
                  transform: `scale(${0.8 + signatureProgress * 0.2})`,
                  transition: "opacity 0.2s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Dispatch Action */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              padding: "0 4px",
            }}
          >
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 700 }}>Total Rework Bill:</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#34d399" }}>${total}.00</span>
          </div>

          <div
            style={{
              background: isDispatching ? "#059669" : "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              color: "#ffffff",
              padding: "16px",
              borderRadius: 14,
              textAlign: "center",
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.06em",
              boxShadow: isDispatching ? "0 0 25px #10b981" : "0 8px 20px rgba(2, 132, 199, 0.4)",
              transform: `scale(${dispatchButtonScale})`,
            }}
          >
            {isDispatching ? "✓ DISPATCHED TO OFFICE" : "⚡ DISPATCH TO OFFICE"}
          </div>
        </div>
      </div>

      {/* Right: Explanatory Motion Callouts */}
      <div style={{ flex: 1, maxWidth: 640 }}>
        <div
          style={{
            background: "rgba(56, 189, 248, 0.15)",
            color: "#38bdf8",
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
          STEP 1 • ON THE DOCK FLOOR
        </div>

        <h2 style={{ fontSize: 50, fontWeight: 900, lineHeight: 1.15, margin: "0 0 20px 0" }}>
          Work-glove friendly.
          <br />
          <span style={{ color: "#38bdf8" }}>Zero paperwork friction.</span>
        </h2>

        <p style={{ fontSize: 22, color: "#94a3b8", lineHeight: 1.5, margin: "0 0 32px 0" }}>
          Forklift operators tap large increment buttons directly from their phone browser.
          No app download required.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ background: "#162b45", border: "1px solid #233f63", borderRadius: 12, padding: "10px 14px", fontSize: 20 }}>
              📍
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Tamper-Proof GPS & MT Time Stamp</div>
              <div style={{ fontSize: 15, color: "#64748b" }}>Embedded right into the photo audit log. Unforgeable legal proof.</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ background: "#162b45", border: "1px solid #233f63", borderRadius: 12, padding: "10px 14px", fontSize: 20 }}>
              ✍️
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Driver Glass Signature Capture</div>
              <div style={{ fontSize: 15, color: "#64748b" }}>Driver confirms rework and acknowledges rate before unhooking.</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ background: "#162b45", border: "1px solid #233f63", borderRadius: 12, padding: "10px 14px", fontSize: 20 }}>
              🚀
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Instant Push to Billing</div>
              <div style={{ fontSize: 15, color: "#64748b" }}>One tap triggers office chime and populates invoice live.</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
