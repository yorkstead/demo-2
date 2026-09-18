import React from "react";
import { Composition } from "remotion";
import { CommercialVideo, TOTAL_DURATION_FRAMES, SCENE_DURATIONS } from "./CommercialVideo";
import { Scene1Crisis } from "./scenes/Scene1Crisis";
import { Scene2Reveal } from "./scenes/Scene2Reveal";
import { Scene3DockAction } from "./scenes/Scene3DockAction";
import { Scene4OfficeSync } from "./scenes/Scene4OfficeSync";
import { Scene5CTA } from "./scenes/Scene5CTA";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Master 60-Second Full Commercial */}
      <Composition
        id="CommercialVideo"
        component={CommercialVideo}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Modular Scene Clips */}
      <Composition
        id="Scene1-Crisis"
        component={Scene1Crisis}
        durationInFrames={SCENE_DURATIONS.SCENE_1_CRISIS}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene2-Reveal"
        component={Scene2Reveal}
        durationInFrames={SCENE_DURATIONS.SCENE_2_REVEAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene3-DockFloor"
        component={Scene3DockAction}
        durationInFrames={SCENE_DURATIONS.SCENE_3_DOCK}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene4-OfficeSync"
        component={Scene4OfficeSync}
        durationInFrames={SCENE_DURATIONS.SCENE_4_OFFICE}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene5-CTA"
        component={Scene5CTA}
        durationInFrames={SCENE_DURATIONS.SCENE_5_CTA}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
