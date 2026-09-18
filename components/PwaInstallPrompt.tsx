"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        sessionStorage.getItem("pwa_prompt_dismissed") === "true" ||
        localStorage.getItem("pwa_is_installed") === "true"
      );
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR hydration guard: must trigger a re-render after mount to avoid server/client mismatch
    setMounted(true);

    // Comprehensive standalone / installed detection
    const checkStandalone = async () => {
      if (typeof window === "undefined") return;

      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
      const isFullscreenMedia = window.matchMedia("(display-mode: fullscreen)").matches;
      const isMinimalUiMedia = window.matchMedia("(display-mode: minimal-ui)").matches;
      const isNavStandalone = Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
      const isReferrerAndroid = document.referrer.includes("android-app://");
      const isInstalledStorage = localStorage.getItem("pwa_is_installed") === "true";

      let isRelatedAppInstalled = false;
      if ("getInstalledRelatedApps" in navigator) {
        try {
          const relatedApps = await (navigator as unknown as { getInstalledRelatedApps: () => Promise<unknown[]> }).getInstalledRelatedApps();
          if (Array.isArray(relatedApps) && relatedApps.length > 0) {
            isRelatedAppInstalled = true;
          }
        } catch (e) {
          // ignore error if not supported or denied
        }
      }

      const installed =
        isStandaloneMedia ||
        isFullscreenMedia ||
        isMinimalUiMedia ||
        isNavStandalone ||
        isReferrerAndroid ||
        isInstalledStorage ||
        isRelatedAppInstalled;

      if (installed) {
        setIsStandalone(true);
        try {
          localStorage.setItem("pwa_is_installed", "true");
        } catch {}
      } else {
        setIsStandalone(false);
      }
    };

    checkStandalone();

    // Listen for display mode changes (e.g. user opens in standalone or windows opens PWA)
    const mediaQueryList = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsStandalone(true);
        try {
          localStorage.setItem("pwa_is_installed", "true");
        } catch {}
      }
    };
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handleDisplayModeChange);
    }

    // Register Service Worker immediately
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((reg) => {
            console.log("[ReworkFlow PWA] Service Worker active with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[ReworkFlow PWA] Service Worker registration failed:", err);
          });
      };

      if (document.readyState === "complete" || document.readyState === "interactive") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
    }

    // Check iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIos(isApple);

    // Capture Chrome/Chromium beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log("[ReworkFlow PWA] captured beforeinstallprompt event");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log("[ReworkFlow PWA] App was successfully installed!");
      setIsStandalone(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem("pwa_is_installed", "true");
      } catch {}
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handleDisplayModeChange);
      }
    };
  }, []);

  const isClientDemo = pathname.startsWith("/denver-express") ||
    (mounted && new URLSearchParams(window.location.search).get("session")?.startsWith("rescue-denver-express-"));

  if (!mounted || isStandalone || dismissed || isClientDemo) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          console.log("[ReworkFlow PWA] User accepted installation prompt");
          setDeferredPrompt(null);
          setIsStandalone(true);
          try {
            localStorage.setItem("pwa_is_installed", "true");
          } catch {}
        } else {
          console.log("[ReworkFlow PWA] User dismissed installation prompt");
        }
      } catch (err) {
        console.error("[ReworkFlow PWA] Error displaying prompt:", err);
      }
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      // In Chrome desktop or Android where prompt was consumed or browser controls omnibox
      alert(
        "To install ReworkFlow as a standalone app:\n\n" +
        "1. Look for the Install icon (computer screen with down arrow) on the right side of the Chrome address bar.\n" +
        "2. Or click the Chrome menu (⋮) -> 'Cast, save, and share' -> 'Install ReworkFlow...'"
      );
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pwa_prompt_dismissed", "true");
    }
  };

  return (
    <>
      {/* Floating Install Pill for Desktop / Android Chrome / iOS */}
      <aside
        aria-label="PWA Installation Prompt"
        className="fixed bottom-4 left-4 sm:left-auto sm:right-4 z-50 flex items-center gap-3 rounded-2xl border border-[#d4af37]/40 bg-[#0b192c]/95 px-3.5 py-2.5 shadow-2xl backdrop-blur-md transition-all hover:border-[#d4af37] max-w-sm"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#060d17] border border-[#d4af37]/40 overflow-hidden shadow-inner">
          {/* Fallback & Icon */}
          <span className="text-xs font-black text-[#d4af37]">RF</span>
        </div>
        
        <div className="flex flex-col text-left pr-1 min-w-0">
          <span className="text-xs font-bold tracking-tight text-white truncate">
            Install ReworkFlow App
          </span>
          <span className="text-[11px] text-[#d4af37] truncate">
            {isIos ? "Full-screen standalone terminal" : "Fast offline dock & dispatch app"}
          </span>
        </div>

        <button
          onClick={handleInstallClick}
          className="ml-auto shrink-0 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d4af37] px-3.5 py-1.5 text-xs font-bold text-[#060d17] shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          {isIos ? "Instructions" : "Install"}
        </button>

        <button
          onClick={handleDismiss}
          className="shrink-0 text-slate-400 hover:text-white text-xs p-1 rounded transition-colors cursor-pointer"
          title="Dismiss for this session"
        >
          ✕
        </button>
      </aside>

      {/* iOS Safari Home Screen Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#d4af37]/40 bg-[#0b192c] p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c375b]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#060d17] text-sm font-black text-[#d4af37] border border-[#d4af37]/50">
                  RF
                </div>
                <h3 className="text-base font-bold text-[#d4af37]">
                  Install on iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="flex items-start gap-3 rounded-xl bg-[#060d17] p-3 border border-[#162b45]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37] font-bold text-[#060d17]">
                  1
                </span>
                <p>
                  Tap the <strong className="text-white">Share</strong> button at the bottom of Safari (the square with an arrow pointing up).
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[#060d17] p-3 border border-[#162b45]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37] font-bold text-[#060d17]">
                  2
                </span>
                <p>
                  Scroll down the action sheet and tap <strong className="text-white">Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[#060d17] p-3 border border-[#162b45]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37] font-bold text-[#060d17]">
                  3
                </span>
                <p>
                  Tap <strong className="text-white">Add</strong> in the top right. ReworkFlow will launch in standalone full-screen mode without browser tabs or address bars!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d4af37] py-2.5 text-center text-xs font-bold text-[#060d17] shadow-lg hover:brightness-110 cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
