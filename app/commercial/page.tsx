"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Play,
  Pause,
  Video,
  Layers,
  Terminal,
  ArrowRight,
  ExternalLink,
  FileText,
  Sparkles,
  Smartphone,
  Laptop,
  Clock,
  CheckCircle2,
  Volume2,
  Download,
  Copy,
  Check,
} from "lucide-react";
import type { PlayerRef } from "@remotion/player";
import { CommercialVideo, TOTAL_DURATION_FRAMES } from "../../remotion/CommercialVideo";

// Dynamically import Remotion Player to guarantee purely client-side rendering
const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

interface SceneInfo {
  name: string;
  timeRange: string;
  frame: number;
  label: string;
  speakerScript: string;
  visualNote: string;
}

const SCENES: SceneInfo[] = [
  {
    name: "The Mountain Shift Crisis",
    timeRange: "0:00 - 0:08",
    frame: 0,
    label: "Scene 1",
    speakerScript:
      "Every cross-dock manager knows the nightmare: a carrier backs into Bay 2 with shifted mountain cargo, crushed pallets, and a driver desperate to make his next drop. You rework the load, but three weeks later... the broker disputes the invoice, the paperwork is missing, and your dock absorbs the cost.",
    visualNote: "Trailer SWFT-55219 inbound alert • $850 unbilled loss ticker • Inbound damage report",
  },
  {
    name: "The Two-Device Reveal",
    timeRange: "0:08 - 0:18",
    frame: 240,
    label: "Scene 2",
    speakerScript:
      "That ends today. Meet ReworkFlow by Yorkstead Systems — the real-time cross-dock rework operating system built for the dock floor, not an office cubicle.",
    visualNote: "Yorkstead Systems crest • ReworkFlow branding • Two-device live pairing beam",
  },
  {
    name: "Mobile Dock Floor in Action",
    timeRange: "0:18 - 0:34",
    frame: 540,
    label: "Scene 3",
    speakerScript:
      "Your forklift operator pulls up the trailer on his phone. Big, touch-friendly counters for work gloves. Tap in pallets, wrap, and labor hours. Add before and after photos for office review. The driver signs right on the glass, and with one tap...",
    visualNote: "GMA Pallet counter +4 • Shrink Wrap +2 • Photo added; location not captured • Animated driver signature",
  },
  {
    name: "Real-Time Office Sync",
    timeRange: "0:34 - 0:48",
    frame: 1020,
    label: "Scene 4",
    speakerScript:
      "...the office hears the chime instantly. No waiting on paper tallies at 5 PM. You have an itemized, indisputable Certificate of Completion ready to bill before the driver even leaves the gate.",
    visualNote: "Two-tone office chime wave • Demo completion record • Accounting export preview",
  },
  {
    name: "Closing Call to Action",
    timeRange: "0:48 - 1:00",
    frame: 1440,
    label: "Scene 5",
    speakerScript:
      "Stop arguing over re-stack charges. Start capturing every dollar in real time. Let’s run a live 2-minute test on your dock today.",
    visualNote: "Denver Express Warehousing showcase • live demo URL • Yorkstead Systems sign-off",
  },
];

export default function CommercialStudioPage() {
  const playerRef = useRef<PlayerRef>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = (e: { detail: { frame: number } }) => {
      setCurrentFrame(e.detail.frame);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    player.addEventListener("frameupdate", onFrameUpdate);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);

    return () => {
      player.removeEventListener("frameupdate", onFrameUpdate);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, []);

  // Determine active scene based on frame
  const activeSceneIndex =
    currentFrame >= 1440
      ? 4
      : currentFrame >= 1020
      ? 3
      : currentFrame >= 540
      ? 2
      : currentFrame >= 240
      ? 1
      : 0;

  const jumpToScene = (frame: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(frame);
      setCurrentFrame(frame);
    }
  };

  const copyCommand = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Navigation */}
      <header className="border-b border-[#1b314d] bg-[#091524]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-black text-xl tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20">
                RF
              </div>
              <span>Rework<span className="text-sky-400">Flow</span></span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Commercial Studio</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dock"
              className="text-xs font-bold bg-[#0f2238] hover:bg-[#162b45] text-sky-400 border border-sky-500/30 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Dock View</span>
            </Link>
            <Link
              href="/office"
              className="text-xs font-bold bg-[#0f2238] hover:bg-[#162b45] text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Office Board</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1b314d] pb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
              Yorkstead Systems • Video Pitch Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Programmatic Commercial Video</span>
              <span className="text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2.5 py-1 rounded-md">
                1080p @ 30fps
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Built with Remotion for Denver Express Warehousing & Cross-Docking (Steve Chapman & Dale Burget).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => copyCommand("bun run remotion:render", "render")}
              className="text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              {copiedCmd === "render" ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{copiedCmd === "render" ? "Command Copied!" : "Render MP4 Video"}</span>
            </button>
            <button
              onClick={() => copyCommand("bun run remotion:preview", "preview")}
              className="text-xs font-bold bg-[#162b45] hover:bg-[#1e3a5f] text-slate-200 border border-[#2d4d75] px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              {copiedCmd === "preview" ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              <span>Remotion Studio</span>
            </button>
          </div>
        </div>

        {/* Video Player & Live Teleprompter Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Top: Remotion Player (7 cols on desktop) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#1e3a5f] bg-black shadow-2xl shadow-black/80 aspect-video flex items-center justify-center">
              <Player
                ref={playerRef}
                component={CommercialVideo}
                durationInFrames={TOTAL_DURATION_FRAMES}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                controls
                autoPlay={false}
                loop
              />
            </div>

            {/* Scene Scrubbers */}
            <div className="bg-[#0b192c] border border-[#1b314d] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="uppercase tracking-wider">Quick Scene Jump</span>
                <span className="font-mono text-amber-400">
                  Frame: {currentFrame} / {TOTAL_DURATION_FRAMES} ({(currentFrame / 30).toFixed(1)}s)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SCENES.map((scene, idx) => (
                  <button
                    key={idx}
                    onClick={() => jumpToScene(scene.frame)}
                    className={`p-2.5 rounded-xl text-left transition-all border ${
                      activeSceneIndex === idx
                        ? "bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10"
                        : "bg-[#0f2238] border-[#1b314d] text-slate-400 hover:text-slate-200 hover:bg-[#162b45]"
                    }`}
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      {scene.label} • {scene.timeRange}
                    </div>
                    <div className="text-xs font-bold truncate mt-0.5">{scene.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right / Side: Commercial Voiceover Script & Teleprompter (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0b192c] border border-[#1b314d] rounded-2xl p-5 flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-[#1b314d] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Live Voiceover Teleprompter</h3>
                </div>
                <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Active: Scene {activeSceneIndex + 1}
                </div>
              </div>

              {/* Scrollable Script list */}
              <div className="space-y-4 overflow-y-auto max-h-[540px] pr-1">
                {SCENES.map((scene, idx) => {
                  const isActive = activeSceneIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => jumpToScene(scene.frame)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#162b45] border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40"
                          : "bg-[#0f2238]/60 border-[#1b314d] opacity-60 hover:opacity-90"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                        <span className={isActive ? "text-amber-400" : "text-slate-400"}>
                          {scene.label}: {scene.name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{scene.timeRange}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isActive ? "text-slate-100 font-medium" : "text-slate-400"}`}>
                        “{scene.speakerScript}”
                      </p>
                      <div className="mt-2 text-[10px] text-sky-400/80 font-mono bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded">
                        👀 {scene.visualNote}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* How to Render MP4 Section */}
        <div className="bg-[#0b192c] border border-[#1b314d] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">CLI Render & Video Export Options</h2>
          </div>
          <p className="text-sm text-slate-400">
            Remotion allows you to render the 60-second broadcast commercial directly from your terminal using headless Chromium and FFmpeg:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#060d17] border border-[#1b314d] rounded-xl p-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                1. Render High-Def MP4 (1080p)
              </div>
              <div className="bg-[#0b192c] rounded-lg p-2.5 font-mono text-xs text-amber-300 flex items-center justify-between border border-[#1b314d]">
                <code>bun run remotion:render</code>
                <button
                  onClick={() => copyCommand("bun run remotion:render", "c1")}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedCmd === "c1" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Generates a pristine 60s broadcast file at <span className="font-mono text-slate-300">out/commercial.mp4</span>.
              </p>
            </div>

            <div className="bg-[#060d17] border border-[#1b314d] rounded-xl p-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                2. Open Remotion Visual Studio
              </div>
              <div className="bg-[#0b192c] rounded-lg p-2.5 font-mono text-xs text-sky-300 flex items-center justify-between border border-[#1b314d]">
                <code>bun run remotion:preview</code>
                <button
                  onClick={() => copyCommand("bun run remotion:preview", "c2")}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedCmd === "c2" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Launches the local Remotion editor to inspect frame-by-frame compositions and customize timing.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
