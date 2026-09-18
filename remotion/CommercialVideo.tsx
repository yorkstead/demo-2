import React from "react";
import { Sequence } from "remotion";
import { Scene1Crisis } from "./scenes/Scene1Crisis";
import { Scene2Reveal } from "./scenes/Scene2Reveal";
import { Scene3DockAction } from "./scenes/Scene3DockAction";
import { Scene4OfficeSync } from "./scenes/Scene4OfficeSync";
import { Scene5CTA } from "./scenes/Scene5CTA";

export const SCENE_DURATIONS = {
  SCENE_1_CRISIS: 240,     // 0 - 8s (8s)
  SCENE_2_REVEAL: 300,     // 8 - 18s (10s)
  SCENE_3_DOCK: 480,       // 18 - 34s (16s)
  SCENE_4_OFFICE: 420,     // 34 - 48s (14s)
  SCENE_5_CTA: 360,        // 48 - 60s (12s)
};

export const TOTAL_DURATION_FRAMES = 1800; // 60 seconds @ 30fps

export const CommercialVideo: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: "#060d17" }}>
      {/* Scene 1: Crisis & Problem (0 - 8s) */}
      <Sequence from={0} durationInFrames={SCENE_DURATIONS.SCENE_1_CRISIS} name="Scene 1: The Mountain Shift">
        <Scene1Crisis />
      </Sequence>

      {/* Scene 2: The Two-Device Reveal (8 - 18s) */}
      <Sequence from={240} durationInFrames={SCENE_DURATIONS.SCENE_2_REVEAL} name="Scene 2: Introducing ReworkFlow">
        <Scene2Reveal />
      </Sequence>

      {/* Scene 3: The Mobile Dock Floor (18 - 34s) */}
      <Sequence from={540} durationInFrames={SCENE_DURATIONS.SCENE_3_DOCK} name="Scene 3: Mobile Dock Floor (/dock)">
        <Scene3DockAction />
      </Sequence>

      {/* Scene 4: The Office Dispatch & PDF (34 - 48s) */}
      <Sequence from={1020} durationInFrames={SCENE_DURATIONS.SCENE_4_OFFICE} name="Scene 4: Office Dispatch (/office)">
        <Scene4OfficeSync />
      </Sequence>

      {/* Scene 5: Closing CTA (48 - 60s) */}
      <Sequence from={1440} durationInFrames={SCENE_DURATIONS.SCENE_5_CTA} name="Scene 5: Closing Call to Action">
        <Scene5CTA />
      </Sequence>
    </div>
  );
};
