"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrivalEta } from "@/components/arrival-eta";
import { installWakeTouchGuard } from "@/lib/wake-touch-guard";
import { DOCK_IDLE_MINUTES } from "@/lib/dock-config";
import {
  Truck,
  Camera,
  Layers,
  CheckCircle,
  AlertTriangle,
  Scale,
  Container,
  Send,
  ArrowRight,
  RotateCcw,
  CheckCheck,
  Smartphone,
  ExternalLink,
  Maximize2,
  X,
  Sun,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { RATES, ReworkJob } from "@/lib/types";
import { SAMPLE_BEFORE_1, SAMPLE_BEFORE_2, SAMPLE_AFTER, SAMPLE_SIGNATURE } from "@/lib/mock-data";
import { OfflineQueue } from "@/lib/offline-queue";
import { DockIntakeStep } from "@/components/dock/DockIntakeStep";
import { DockPhotosStep } from "@/components/dock/DockPhotosStep";
import { DockSuppliesStep } from "@/components/dock/DockSuppliesStep";
import { DockSignatureStep } from "@/components/dock/DockSignatureStep";
import { Active5TabletSimulator } from "@/components/dock/Active5TabletSimulator";

export default function DockOperatorPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  useEffect(() => {
    // The tally can scroll on tablets. Start sign-off with the proof photo in
    // view rather than retaining the previous step's scroll offset.
    if (step === 4) window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);
  const [serviceType, setServiceType] = useState<ReworkJob['serviceType']>("Shifted Pallets");

  // Form State
  const [trailerNumber, setTrailerNumber] = useState("SWFT-55219");
  const [carrierName, setCarrierName] = useState("Swift Transportation");
  const [driverName, setDriverName] = useState("Marcus Vance");
  const [driverPhone, setDriverPhone] = useState("(720) 555-0194");
  const [bayNumber, setBayNumber] = useState("Bay 2");

  // Session & Display State
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("session") || "demo-main";
    }
    return "demo-main";
  });
  const [showActive5Frame, setShowActive5Frame] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("frame") === "active5";
    }
    return false;
  });
  const [isEmbedded, setIsEmbedded] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("embedded") === "true";
    }
    return false;
  });
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const o = params.get("orientation");
      if (o === "landscape" || o === "portrait") return o;
      // Only default to landscape on actual mobile / tablet aspect ratios or embedded frames
      return window.innerWidth > window.innerHeight && window.innerHeight <= 600 ? "landscape" : "portrait";
    }
    return "portrait";
  });

  // Calculate whether to show the specialized mobile forklift landscape layout
  // On large desktop/laptop screens, keep standard desktop layout unless embedded in simulator or explicitly requested
  const isMobileLandscape = isEmbedded
    ? orientation === "landscape"
    : orientation === "landscape" && (typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("orientation") === "landscape" || window.innerHeight <= 600) : false);

  // Listen for orientation changes (window resize or parent simulator postMessage)
  useEffect(() => {
    const handleResize = () => {
      const params = new URLSearchParams(window.location.search);
      const o = params.get("orientation");
      if (o === "landscape" || o === "portrait") {
        setOrientation(o);
      } else {
        setOrientation(window.innerWidth > window.innerHeight && window.innerHeight <= 600 ? "landscape" : "portrait");
      }
    };
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "DOCK_ORIENTATION") {
        if (e.data.orientation === "landscape" || e.data.orientation === "portrait") {
          setOrientation(e.data.orientation);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("message", handleMsg);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("message", handleMsg);
    };
  }, []);

  // Listen for navigation & exit messages from Active5 simulator
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "DOCK_NAV") {
        if (e.data.action === "home") {
          setStep(1);
        } else if (e.data.action === "back") {
          setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : 1));
        }
      } else if (e.data?.type === "EXIT_TABLET_FRAME") {
        setShowActive5Frame(false);
        if (typeof window !== "undefined") {
          const u = new URL(window.location.href);
          u.searchParams.delete("frame");
          u.searchParams.delete("orientation");
          u.searchParams.delete("embedded");
          window.history.replaceState(null, "", u.pathname + (u.searchParams.toString() ? `?${u.searchParams.toString()}` : ""));
        }
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  // Reservation State
  const [incomingReservations, setIncomingReservations] = useState<ReworkJob[]>([]);
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState(0);
  const newJobRequestId = useRef<string | null>(null);
  const [rescueContext, setRescueContext] = useState<ReworkJob['rescueMetadata']>();

  // Offline Queue State
  const [offlinePendingCount, setOfflinePendingCount] = useState(() =>
    typeof window !== "undefined" ? OfflineQueue.getPendingCount() : 0
  );
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Monitor network connectivity & process offline queue
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = async () => {
      setIsOnline(true);
      const res = await OfflineQueue.processQueue();
      setOfflinePendingCount(res.remaining);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = () => {
      setOfflinePendingCount(OfflineQueue.getPendingCount());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("rework-offline-queue-change", handleQueueChange);

    // Initial check to drain queue if online
    if (navigator.onLine) {
      OfflineQueue.processQueue().then((res) => setOfflinePendingCount(res.remaining));
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("rework-offline-queue-change", handleQueueChange);
    };
  }, []);

  // Real-time SSE / Poll for incoming reservations from mobile /reserve
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;

    const fetchReservations = async () => {
      try {
        const res = await fetch(`/api/jobs?session=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.jobs)) {
          const reserved = data.jobs.filter((j: ReworkJob) => j.status === "Reserved");
          setIncomingReservations(reserved);
        }
      } catch (e) {
        console.warn("Poll reservations error:", e);
      }
    };

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        const streamUrl = `/api/jobs/stream?session=${encodeURIComponent(sessionId)}`;
        eventSource = new EventSource(streamUrl);

        const updateFromJobs = (jobs: ReworkJob[]) => {
          if (!isMounted) return;
          const reserved = jobs.filter((j: ReworkJob) => j.status === "Reserved");
          setIncomingReservations(reserved);
        };

        eventSource.addEventListener("init", (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (Array.isArray(parsed.jobs)) updateFromJobs(parsed.jobs);
          } catch {}
        });

        eventSource.addEventListener("job_update", (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (Array.isArray(parsed.jobs)) {
              updateFromJobs(parsed.jobs);
            } else {
              fetchReservations();
            }
          } catch {}
        });
      } catch {}
    }

    fetchReservations();
    const interval = setInterval(fetchReservations, 3000);
    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [sessionId]);

  const handleCheckInReserved = (job: ReworkJob) => {
    setActiveReservationId(job.id);
    setActiveVersion(job.version ?? 0);
    setTrailerNumber(job.trailerNumber);
    setCarrierName(job.carrierName);
    setDriverName(job.driverName);
    setDriverPhone(job.driverPhone);
    setBayNumber(job.bayNumber);
    setServiceType(job.serviceType);
    setRescueContext(job.rescueMetadata);
    if (job.rescueMetadata || job.phoneIntake || job.id.startsWith("WEB-")) {
      setBefore1(job.beforePhotos[0] || '');
      setBefore2(job.beforePhotos[1] || '');
      setAfterPhoto('');
      setSavedSignature('');
      setHasDrawnSignature(false);
    }
    if (job.palletsCount !== undefined) setPallets(job.palletsCount);
    if (job.wrapCount !== undefined) setWrap(job.wrapCount);
    if (job.cornersCount !== undefined) setCorners(job.cornersCount);
    if (job.laborHours !== undefined) setLabor(job.laborHours);
    if (job.scaleCheck !== undefined) setScaleCheck(job.scaleCheck);
    if (job.debrisFee !== undefined) setDebrisFee(job.debrisFee);
    setStep(2); // Jump straight to taking before photos
  };

  // Photos
  const [before1, setBefore1] = useState(SAMPLE_BEFORE_1);
  const [before2, setBefore2] = useState(SAMPLE_BEFORE_2);
  const [afterPhoto, setAfterPhoto] = useState(SAMPLE_AFTER);

  // Hidden File Inputs for Direct Camera / Photo Capture
  const fileInputBefore1Ref = useRef<HTMLInputElement | null>(null);
  const fileInputBefore2Ref = useRef<HTMLInputElement | null>(null);
  const fileInputAfterRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoCapture = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (photoUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Full Immersive Dock Screen (Hide Top Bar)
  const [hideTopBar, setHideTopBar] = useState(false);

  const screensaverRef = useRef<HTMLDialogElement>(null);
  const lastActivityRef = useRef(0);
  const wakeGuardRef = useRef<ReturnType<typeof installWakeTouchGuard> | null>(null);

  useEffect(() => {
    // The simulator toolbar is not a sleeping dock screen. Its iframe owns
    // its own guard; intercepting the parent can trap the Exit controls.
    if (showActive5Frame && !isEmbedded) return;
    const guard = installWakeTouchGuard(window);
    wakeGuardRef.current = guard;
    let suspended = document.visibilityState === "hidden";
    if (suspended) guard.suspend();
    const suspend = () => { suspended = true; guard.suspend(); };
    const resume = () => {
      if (!suspended || document.visibilityState !== "visible") return;
      suspended = false;
      guard.start();
      screensaverRef.current?.close();
      lastActivityRef.current = Date.now();
    };
    const visibility = () => document.visibilityState === "hidden" ? suspend() : resume();
    document.addEventListener("visibilitychange", visibility);
    // Focus moves between iframe, toolbar, file picker and browser chrome
    // during ordinary use. Only page visibility/lifecycle signals mean sleep.
    window.addEventListener("pagehide", suspend);
    window.addEventListener("pageshow", resume);
    return () => {
      guard.dispose();
      wakeGuardRef.current = null;
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", suspend);
      window.removeEventListener("pageshow", resume);
    };
  }, [showActive5Frame, isEmbedded]);

  useEffect(() => {
    lastActivityRef.current = Date.now();
    const recordActivity = () => { lastActivityRef.current = Date.now(); };
    const checkIdle = () => {
      const dialog = screensaverRef.current;
      if (document.visibilityState === "visible" && dialog && !dialog.open &&
          Date.now() - lastActivityRef.current >= DOCK_IDLE_MINUTES * 60_000) {
        // A modal in the top layer also covers the fullscreen signature and makes
        // the underlying form inert, without unmounting it or losing its canvas.
        dialog.showModal();
      }
    };
    const events = ["pointerdown", "pointermove", "keydown", "input", "wheel"] as const;
    events.forEach((event) => document.addEventListener(event, recordActivity, { capture: true, passive: true }));
    document.addEventListener("visibilitychange", checkIdle);
    const timer = window.setInterval(checkIdle, 1000);
    return () => {
      window.clearInterval(timer);
      events.forEach((event) => document.removeEventListener(event, recordActivity, true));
      document.removeEventListener("visibilitychange", checkIdle);
    };
  }, []);

  const dismissScreensaver = () => {
    wakeGuardRef.current?.start();
    lastActivityRef.current = Date.now();
    screensaverRef.current?.close();
  };

  // Counters
  const [pallets, setPallets] = useState(4);
  const [wrap, setWrap] = useState(2);
  const [corners, setCorners] = useState(8);
  const [labor, setLabor] = useState(1.25);
  const [scaleCheck, setScaleCheck] = useState(true);
  const [debrisFee, setDebrisFee] = useState(true);

  // Signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [isFullScreenSig, setIsFullScreenSig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);

  // Forklift Tablet Stationary Mode / Screen Wake Lock
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockSentinelRef = useRef<any>(null);

  // Request Screen Wake Lock so the forklift tablet screen never locks or dims
  useEffect(() => {
    let released = false;

    const requestWakeLock = async () => {
      if (typeof navigator !== "undefined" && "wakeLock" in navigator && !released) {
        try {
          const sentinel = await (navigator as any).wakeLock.request("screen");
          wakeLockSentinelRef.current = sentinel;
          setWakeLockActive(true);
          sentinel.addEventListener("release", () => {
            if (!released) setWakeLockActive(false);
          });
        } catch (err) {
          console.log("Wake Lock request:", err);
        }
      }
    };

    requestWakeLock();

    // Re-acquire on visibility change (e.g. if driver switched tabs or unlocked tablet)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
      }
    };
  }, []);

  // Auto open fullscreen signature if device is rotated to landscape while on step 4 (and job not yet completed)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOrientation = () => {
      if (step === 4 && !completedJobId) {
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        // On mobile/tablets where width > height and max dimension is typical device size
        if (isLandscape && window.innerHeight < 600) {
          setIsFullScreenSig(true);
        }
      }
    };
    window.addEventListener("resize", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);
    return () => {
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, [step, completedJobId]);

  // Sync savedSignature to fullscreen canvas whenever it opens or signature changes
  useEffect(() => {
    if (isFullScreenSig && fullCanvasRef.current) {
      const canvas = fullCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (savedSignature) {
          const img = new Image();
          img.onload = () => {
            // Draw centered maintaining aspect ratio
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            ctx.drawImage(img, x, y, w, h);
          };
          img.src = savedSignature;
        }
      }
    }
  }, [isFullScreenSig, savedSignature]);

  // Calculate live total
  const liveTotal =
    pallets * RATES.pallets +
    wrap * RATES.wrap +
    corners * RATES.corners +
    labor * RATES.labor +
    (scaleCheck ? RATES.scale : 0) +
    (debrisFee ? RATES.debris : 0);

  // Restore signature on canvas when entering step 4
  useEffect(() => {
    if (step === 4 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (savedSignature) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = savedSignature;
        }
      }
    }
  }, [step, savedSignature]);

  // Touch drawing handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, targetCanvas?: HTMLCanvasElement | null) => {
    const canvas = targetCanvas || canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawingOn = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, targetCanvas: HTMLCanvasElement | null) => {
    if (!targetCanvas) return;
    const coords = getCoordinates(e, targetCanvas);
    if (!coords) return;
    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawnSignature(true);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = targetCanvas === fullCanvasRef.current ? 4 : 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const drawOn = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, targetCanvas: HTMLCanvasElement | null) => {
    if (!isDrawing || !targetCanvas) return;
    const coords = getCoordinates(e, targetCanvas);
    if (!coords) return;
    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawingOn = (targetCanvas: HTMLCanvasElement | null) => {
    // Screen rest can trigger mouseleave without a drawing gesture. Do not
    // re-save and rescale the signature simply because an overlay covered it.
    if (!isDrawing) return;
    setIsDrawing(false);
    if (targetCanvas) {
      const data = targetCanvas.toDataURL();
      setSavedSignature(data);
      setHasDrawnSignature(true);
    }
  };

  // Standard inline canvas event wrappers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => startDrawingOn(e, canvasRef.current);
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => drawOn(e, canvasRef.current);
  const stopDrawing = () => stopDrawingOn(canvasRef.current);

  // Fullscreen canvas event wrappers
  const startDrawingFull = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => startDrawingOn(e, fullCanvasRef.current);
  const drawFull = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => drawOn(e, fullCanvasRef.current);
  const stopDrawingFull = () => stopDrawingOn(fullCanvasRef.current);

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (fullCanvasRef.current) {
      const ctx = fullCanvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, fullCanvasRef.current.width, fullCanvasRef.current.height);
    }
    setSavedSignature(null);
    setHasDrawnSignature(false);
  };

  const loadSampleSignature = () => {
    const drawSig = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = canvas === fullCanvasRef.current ? 4 : 3;
      ctx.lineCap = "round";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      const sx = canvas.width / 400;
      const sy = canvas.height / 120;
      ctx.moveTo(30 * sx, 70 * sy);
      ctx.bezierCurveTo(70 * sx, 20 * sy, 130 * sx, 110 * sy, 180 * sx, 50 * sy);
      ctx.bezierCurveTo(220 * sx, 30 * sy, 260 * sx, 90 * sy, 330 * sx, 45 * sy);
      ctx.stroke();
    };

    drawSig(canvasRef.current);
    drawSig(fullCanvasRef.current);

    const activeCanvas = fullCanvasRef.current || canvasRef.current;
    if (activeCanvas) {
      const data = activeCanvas.toDataURL();
      setSavedSignature(data);
      setHasDrawnSignature(true);
    }
  };

  const cycleSample = () => {
    const samples = [
      { t: "SWFT-55219", c: "Swift Transportation", d: "Marcus Vance", p: "(720) 555-0194", b: "Bay 2" },
      { t: "KNIG-88401", c: "Knight Transportation", d: "David Ross", p: "(303) 555-9812", b: "Bay 4" },
      { t: "SCHN-10294", c: "Schneider National", d: "Robert Miller", p: "(720) 555-3341", b: "Bay 1" },
      { t: "TQLX-49102", c: "TQL / Apex Direct", d: "Sarah Jenkins", p: "(970) 555-7720", b: "Bay 3" },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    setTrailerNumber(pick.t);
    setCarrierName(pick.c);
    setDriverName(pick.d);
    setDriverPhone(pick.p);
    setBayNumber(pick.b);
  };

  // Submit Job to API for cross-device sync
  const handleSubmitJob = async () => {
    setSubmitError(null);

    const canvas = canvasRef.current;
    const signatureData = canvas && hasDrawnSignature ? canvas.toDataURL() : (savedSignature || "");
    if (!signatureData) {
      setSubmitError("Driver signature is required before dispatching certificate.");
      return;
    }

    setSubmitting(true);
    try {
      newJobRequestId.current ??= `RW-${crypto.randomUUID()}`;
      const payload = {
        id: activeReservationId || newJobRequestId.current,
        version: activeVersion,
        status: "Completed",
        trailerNumber,
        carrierName,
        driverName,
        driverPhone,
        bayNumber,
        serviceType,
        palletsCount: pallets,
        wrapCount: wrap,
        cornersCount: corners,
        laborHours: labor,
        scaleCheck,
        debrisFee,
        totalAmount: liveTotal,
        beforePhotos: rescueContext ? [before1, before2].filter(Boolean) : [before1, before2],
        afterPhotos: rescueContext ? [afterPhoto].filter(Boolean) : [afterPhoto],
        signatureData,
        defectTags: rescueContext ? ['DEMO INTAKE', rescueContext.details.problem] : ["Mountain Shift (I-70)", "Pallet Wall Collapse"],
      };

      const res = await fetch(`/api/jobs?session=${encodeURIComponent(sessionId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.job) {
        setCompletedJobId(data.job.id);
        setIsFullScreenSig(false);
        setSubmitError(null);
      } else {
        setSubmitError(data.error || "Dispatch failed. Please check form data and retry.");
      }
    } catch (err) {
      console.warn("Network error during submission, staging in offline queue:", err);
      // Stage locally in offline queue so work is never lost
      const queued = OfflineQueue.enqueue(sessionId, {
        id: activeReservationId || newJobRequestId.current,
        version: activeVersion,
        status: "Completed",
        trailerNumber,
        carrierName,
        driverName,
        driverPhone,
        bayNumber,
        serviceType,
        palletsCount: pallets,
        wrapCount: wrap,
        cornersCount: corners,
        laborHours: labor,
        scaleCheck,
        debrisFee,
        totalAmount: liveTotal,
        beforePhotos: rescueContext ? [before1, before2].filter(Boolean) : [before1, before2],
        afterPhotos: rescueContext ? [afterPhoto].filter(Boolean) : [afterPhoto],
        signatureData,
        defectTags: rescueContext ? ['DEMO INTAKE', rescueContext.details.problem] : ["Mountain Shift (I-70)", "Pallet Wall Collapse"],
      });
      setCompletedJobId(queued.id);
      setIsFullScreenSig(false);
      setSubmitError(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Render Samsung Galaxy Tab Active5 Tablet Simulator Frame when requested
  if (showActive5Frame && !isEmbedded) {
    return (
      <Active5TabletSimulator
        sessionId={sessionId}
        onExit={() => {
          setShowActive5Frame(false);
          if (typeof window !== "undefined") {
            const u = new URL(window.location.href);
            u.searchParams.delete("frame");
            u.searchParams.delete("orientation");
            window.history.replaceState(null, "", u.pathname + (u.searchParams.toString() ? `?${u.searchParams.toString()}` : ""));
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-100 flex flex-col font-sans select-none overscroll-none touch-manipulation pb-8">
      <dialog
        ref={screensaverRef}
        aria-label="Screen resting. Touch anywhere to return to your job."
        className="fixed inset-0 m-0 h-dvh w-screen max-h-none max-w-none border-0 bg-black p-0 text-black backdrop:bg-black"
        onCancel={(event) => { event.preventDefault(); dismissScreensaver(); }}
        onClose={() => { lastActivityRef.current = Date.now(); }}
      >
        <button
          type="button"
          aria-label="Return to your job"
          className="h-full w-full cursor-pointer bg-black outline-none touch-manipulation"
          onClick={(event) => {
            // Dismiss only after the complete tap, so it cannot hit a job control.
            event.preventDefault();
            event.stopPropagation();
            dismissScreensaver();
          }}
        ><span className="sr-only">Touch anywhere to return to your job</span></button>
      </dialog>
      {/* Top Mobile Bar - Responsive and clean on phones and tablets */}
      {!hideTopBar ? (
        <header
          className={`bg-[#0b192c] border-b border-[#233f63] sticky top-0 z-30 shadow-md flex items-center justify-between gap-2 ${
            isMobileLandscape ? "px-3 py-1.5" : "px-3 sm:px-4 py-2.5"
          }`}
        >
          {/* Brand & Terminal Station */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37] text-[#0b192c] font-black flex items-center justify-center text-xs shrink-0 shadow">
              DE
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-white truncate">Denver Express</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] font-bold border border-[#d4af37]/30 shrink-0">
                  {bayNumber}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate">Terminal 6030 Washington St</p>
            </div>
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Wake Lock Screen On Pill */}
            <button
              type="button"
              onClick={async () => {
                if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
                  if (wakeLockActive && wakeLockSentinelRef.current) {
                    await wakeLockSentinelRef.current.release();
                    setWakeLockActive(false);
                  } else {
                    try {
                      const s = await (navigator as any).wakeLock.request("screen");
                      wakeLockSentinelRef.current = s;
                      setWakeLockActive(true);
                    } catch (e) {}
                  }
                }
              }}
              className={`flex items-center gap-1 text-[10px] sm:text-xs px-2 sm:px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                wakeLockActive
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-sm shadow-amber-500/20"
                  : "bg-[#162b45] border-[#233f63] text-slate-400 hover:text-white"
              }`}
              title="Screen Stay Awake: Tablet will not sleep or lock while mounted on forklift"
            >
              <Sun className={`w-3.5 h-3.5 ${wakeLockActive ? "text-amber-400 animate-spin-slow" : "text-slate-400"}`} />
              <span className="hidden sm:inline">{wakeLockActive ? "Awake: ON" : "Stay Awake"}</span>
            </button>

            {/* Offline Status / Pending Queue Pill */}
            {!isOnline || offlinePendingCount > 0 ? (
              <div
                className={`flex items-center gap-1 text-[10px] sm:text-xs px-2 py-1 rounded-lg border font-bold ${
                  !isOnline
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-sky-500/20 border-sky-500/40 text-sky-300"
                }`}
                title={!isOnline ? "Network offline - Submissions will queue locally" : "Queued jobs syncing to server"}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${!isOnline ? "bg-amber-400" : "bg-sky-400 animate-pulse"}`}></span>
                <span>{!isOnline ? "Offline" : "Syncing"} {offlinePendingCount > 0 && `(${offlinePendingCount})`}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live</span>
              </div>
            )}

            {/* Office link */}
            <Link
              href={sessionId ? `/office?session=${encodeURIComponent(sessionId)}` : "/office"}
              className="text-[10px] sm:text-xs bg-[#162b45] hover:bg-[#233f63] text-slate-200 px-2 py-1.5 rounded-lg border border-[#233f63] flex items-center gap-1 font-semibold"
            >
              <span>Office</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </Link>

            {/* Active5 Frame Simulator Mode Toggle (only when not embedded) */}
            {!isEmbedded ? (
              <button
                type="button"
                onClick={() => {
                  setShowActive5Frame(true);
                  if (typeof window !== "undefined") {
                    const u = new URL(window.location.href);
                    u.searchParams.set("frame", "active5");
                    window.history.replaceState(null, "", u.toString());
                  }
                }}
                className="text-[10px] sm:text-xs bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] px-2 py-1.5 rounded-lg border border-[#d4af37]/40 flex items-center gap-1 font-bold transition cursor-pointer"
                title="Display tablet screen in Samsung Galaxy Tab Active5 frame (1:1 physical size)"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">Active5 Frame</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.parent.postMessage({ type: "EXIT_TABLET_FRAME" }, "*");
                  }
                }}
                className="text-[10px] sm:text-xs bg-rose-600 hover:bg-rose-500 text-white px-2 py-1.5 rounded-lg font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
                title="Exit tablet frame and return to regular browser window"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Exit Tablet</span>
              </button>
            )}

            {/* Hide Top Bar for full kiosk mode */}
            <button
              type="button"
              onClick={() => setHideTopBar(true)}
              className="p-1.5 text-slate-400 hover:text-white bg-[#162b45] hover:bg-[#233f63] rounded-lg border border-[#233f63] transition cursor-pointer"
              title="Hide top bar for complete full-screen view"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      ) : (
        /* Floating Unhide Pill when Top Bar is Hidden */
        <div className="fixed top-2 right-2 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHideTopBar(false)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b192c]/90 hover:bg-[#162b45] text-slate-300 hover:text-white border border-[#233f63] shadow-lg backdrop-blur text-[10px] font-semibold transition"
            title="Restore top bar"
          >
            <Eye className="w-3 h-3 text-[#d4af37]" />
            <span>Show Bar</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <main
        className={`flex-1 w-full mx-auto ${
          isMobileLandscape
            ? "max-w-4xl p-2 sm:p-3 space-y-2.5"
            : "max-w-lg md:max-w-3xl lg:max-w-5xl p-3 sm:p-5 space-y-4"
        }`}
      >

        {/* COMPLETED SUCCESS STATE */}
        {completedJobId ? (
          <div className="bg-[#0f2238] border-2 border-emerald-500/60 rounded-2xl p-6 text-center space-y-5 shadow-2xl animate-fade-in my-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 mx-auto flex items-center justify-center">
              <CheckCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                Rework Sealed & Dispatched
              </span>
              <h2 className="text-2xl font-black text-white">
                Job #{completedJobId}
              </h2>
              <p className="text-xs text-slate-300">
                Trailer <span className="font-mono text-[#d4af37] font-bold">{trailerNumber}</span> ({carrierName})
              </p>
            </div>

            <div className="bg-[#060d17] border border-[#233f63] rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Amount Due:</span>
                <span className="font-mono font-bold text-sm text-[#d4af37]">${liveTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dock Bay:</span>
                <span className="text-white font-semibold">{bayNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Demo SMS preview (not sent):</span>
                <span className="text-emerald-400 font-mono font-semibold">{driverPhone}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Office Billing Board:</span>
                <span className="text-blue-400 font-semibold">Synced in Real Time ⚡</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  setCompletedJobId(null);
                  setActiveReservationId(null);
                  newJobRequestId.current = null;
                  setActiveVersion(0);
                  if (rescueContext) setServiceType('Shifted Pallets');
                  setRescueContext(undefined);
                  setSubmitError(null);
                  setStep(1);
                  setPallets(4);
                  setWrap(2);
                  setCorners(8);
                  setLabor(1.25);
                  setScaleCheck(true);
                  setDebrisFee(true);
                  setBefore1(SAMPLE_BEFORE_1);
                  setBefore2(SAMPLE_BEFORE_2);
                  setAfterPhoto(SAMPLE_AFTER);
                  setSavedSignature(null);
                  setHasDrawnSignature(false);
                  cycleSample();
                }}
                className="w-full py-4 sm:py-5 rounded-2xl bg-[#d4af37] hover:bg-[#b89628] active:scale-[0.99] text-[#0b192c] font-black text-base sm:text-lg transition shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-3 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                <span>Start Next Inbound Trailer</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Progress Pills - Forklift Touch Sized */}
            <div
              className={`bg-[#0f2238] border border-[#233f63] flex items-center justify-between font-bold shadow-lg ${
                isMobileLandscape ? "rounded-xl p-1.5 text-xs" : "rounded-2xl p-2.5 sm:p-3 text-xs sm:text-sm"
              }`}
            >
              <button
                onClick={() => setStep(1)}
                className={`flex-1 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                  isMobileLandscape ? "py-1.5" : "py-2 sm:py-2.5"
                } ${
                  step === 1 ? "bg-[#d4af37] text-[#0b192c] shadow-md shadow-[#d4af37]/20 font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black ${step === 1 ? "bg-[#0b192c] text-[#d4af37]" : "bg-[#162b45] text-slate-300"}`}>1</span>
                <span className="tracking-wide uppercase text-[10px] sm:text-xs">1. Intake</span>
              </button>
              <div className="w-1.5 sm:w-4" />
              <button
                onClick={() => setStep(2)}
                className={`flex-1 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                  isMobileLandscape ? "py-1.5" : "py-2 sm:py-2.5"
                } ${
                  step === 2 ? "bg-[#d4af37] text-[#0b192c] shadow-md shadow-[#d4af37]/20 font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black ${step === 2 ? "bg-[#0b192c] text-[#d4af37]" : "bg-[#162b45] text-slate-300"}`}>2</span>
                <span className="tracking-wide uppercase text-[10px] sm:text-xs">2. Before</span>
              </button>
              <div className="w-1.5 sm:w-4" />
              <button
                onClick={() => setStep(3)}
                className={`flex-1 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                  isMobileLandscape ? "py-1.5" : "py-2 sm:py-2.5"
                } ${
                  step === 3 ? "bg-[#d4af37] text-[#0b192c] shadow-md shadow-[#d4af37]/20 font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black ${step === 3 ? "bg-[#0b192c] text-[#d4af37]" : "bg-[#162b45] text-slate-300"}`}>3</span>
                <span className="tracking-wide uppercase text-[10px] sm:text-xs">3. Tally</span>
              </button>
              <div className="w-1.5 sm:w-4" />
              <button
                onClick={() => setStep(4)}
                className={`flex-1 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                  isMobileLandscape ? "py-1.5" : "py-2 sm:py-2.5"
                } ${
                  step === 4 ? "bg-[#d4af37] text-[#0b192c] shadow-md shadow-[#d4af37]/20 font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black ${step === 4 ? "bg-[#0b192c] text-[#d4af37]" : "bg-[#162b45] text-slate-300"}`}>4</span>
                <span className="tracking-wide uppercase text-[10px] sm:text-xs">4. Sign</span>
              </button>
            </div>

            {/* STEP 1: INTAKE */}
            {step === 1 && (
              <DockIntakeStep
                incomingReservations={incomingReservations}
                handleCheckInReserved={handleCheckInReserved}
                serviceType={serviceType}
                setServiceType={setServiceType}
                trailerNumber={trailerNumber}
                setTrailerNumber={setTrailerNumber}
                carrierName={carrierName}
                setCarrierName={setCarrierName}
                bayNumber={bayNumber}
                setBayNumber={setBayNumber}
                driverName={driverName}
                setDriverName={setDriverName}
                driverPhone={driverPhone}
                setDriverPhone={setDriverPhone}
                cycleSample={cycleSample}
                onContinue={() => setStep(2)}
                isLandscape={isMobileLandscape}
              />
            )}

            {/* STEP 2: BEFORE PHOTOS */}
            {step === 2 && (
              <DockPhotosStep
                rescueContext={rescueContext}
                before1={before1}
                setBefore1={setBefore1}
                before2={before2}
                setBefore2={setBefore2}
                fileInputBefore1Ref={fileInputBefore1Ref}
                fileInputBefore2Ref={fileInputBefore2Ref}
                handlePhotoCapture={handlePhotoCapture}
                onBack={() => setStep(1)}
                onContinue={() => setStep(3)}
                isLandscape={isMobileLandscape}
              />
            )}

            {/* STEP 3: WORK & TALLY */}
            {step === 3 && (
              <DockSuppliesStep
                liveTotal={liveTotal}
                pallets={pallets}
                setPallets={setPallets}
                wrap={wrap}
                setWrap={setWrap}
                corners={corners}
                setCorners={setCorners}
                labor={labor}
                setLabor={setLabor}
                scaleCheck={scaleCheck}
                setScaleCheck={setScaleCheck}
                debrisFee={debrisFee}
                setDebrisFee={setDebrisFee}
                onBack={() => setStep(2)}
                onContinue={() => setStep(4)}
                isLandscape={isMobileLandscape}
              />
            )}

            {/* STEP 4: AFTER PROOF & SIGNATURE */}
            {step === 4 && (
              <DockSignatureStep
                liveTotal={liveTotal}
                driverName={driverName}
                afterPhoto={afterPhoto}
                setAfterPhoto={setAfterPhoto}
                fileInputAfterRef={fileInputAfterRef}
                handlePhotoCapture={handlePhotoCapture}
                canvasRef={canvasRef}
                hasDrawnSignature={hasDrawnSignature}
                savedSignature={savedSignature}
                startDrawing={startDrawing}
                draw={draw}
                stopDrawing={stopDrawing}
                loadSampleSignature={loadSampleSignature}
                clearCanvas={clearCanvas}
                setIsFullScreenSig={setIsFullScreenSig}
                submitError={submitError}
                submitting={submitting}
                onBack={() => setStep(3)}
                onSubmit={handleSubmitJob}
                isLandscape={isMobileLandscape}
              />
            )}
          </>
        )}

      </main>

      {/* FULL SCREEN DRIVER SIGNATURE OVERLAY */}
      {isFullScreenSig && !completedJobId && (
        <div className="fixed inset-0 z-50 bg-[#060d17]/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-3 bg-[#0f2238] border border-[#233f63] rounded-xl px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide">
                  DRIVER GLASS SIGNATURE PAD
                </h3>
                <p className="text-[11px] text-slate-400">
                  Trailer <strong className="text-white">{trailerNumber}</strong> • Driver: <strong className="text-white">{driverName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadSampleSignature}
                className="text-xs px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 font-semibold transition"
              >
                Demo Sign
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 font-semibold transition"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsFullScreenSig(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition ml-1"
                aria-label="Close fullscreen signature"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="my-3 flex-1 relative bg-slate-950 border-2 border-[#d4af37]/50 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center touch-none">
            <canvas
              ref={fullCanvasRef}
              width={900}
              height={400}
              className="w-full h-full cursor-crosshair touch-none bg-slate-950"
              onMouseDown={startDrawingFull}
              onMouseMove={drawFull}
              onMouseUp={stopDrawingFull}
              onMouseLeave={stopDrawingFull}
              onTouchStart={startDrawingFull}
              onTouchMove={drawFull}
              onTouchEnd={stopDrawingFull}
            />

            {/* Baseline guideline for signature */}
            <div className="pointer-events-none absolute left-10 right-10 bottom-16 border-b border-dashed border-slate-700/60" />
            <div className="pointer-events-none absolute left-12 bottom-18 text-[11px] text-slate-600 font-mono uppercase tracking-wider">
              ✖ Sign on line above
            </div>

            {!hasDrawnSignature && !savedSignature && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-sm gap-1">
                <span className="font-semibold text-slate-400">Driver Sign With Finger or Stylus Across Full Glass</span>
                <span className="text-xs text-slate-600">High-resolution audit vector capture</span>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0f2238] border border-[#233f63] rounded-xl px-4 py-3 shadow-lg">
            <p className="text-[11px] text-slate-400 leading-tight max-w-xl text-center sm:text-left">
              &ldquo;I hereby certify cargo has been restacked, secured, inspected, and accepted in road-ready condition.&rdquo;
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsFullScreenSig(false)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#233f63] text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!hasDrawnSignature && !savedSignature}
                onClick={() => {
                  // Ensure saved signature is set from full canvas
                  if (fullCanvasRef.current) {
                    const data = fullCanvasRef.current.toDataURL();
                    setSavedSignature(data);
                    setHasDrawnSignature(true);
                  }
                  setIsFullScreenSig(false);
                }}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0b192c] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept &amp; Save Signature</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

