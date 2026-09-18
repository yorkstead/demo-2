"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { ArrivalEta } from "@/components/arrival-eta";
import { PhoneIntake } from "@/components/PhoneIntake";
import {
  LayoutDashboard,
  TrendingUp,
  Download,
  Printer,
  X,
  Smartphone,
  CheckCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Shield,
  Lock,
  FileText,
  Calendar,
  Filter,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { ReworkJob, RATES, AuditLogEntry } from "@/lib/types";
import { playNotificationChime, getAudioContext } from "@/lib/sound";

// CSV Escaping with Formula Injection Neutralization
function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Neutralize spreadsheet formula injection (=, +, -, @, \t, \r)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export default function OfficeBillingPage() {
  const [jobs, setJobs] = useState<ReworkJob[]>([]);
  const [activeJob, setActiveJob] = useState<ReworkJob | null>(null);
  const [newArrivalAlert, setNewArrivalAlert] = useState<ReworkJob | null>(null);
  const [isPending, startTransition] = useTransition();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // QuickBooks Export Modal State
  const [qbModalOpen, setQbModalOpen] = useState(false);
  const [qbFilter, setQbFilter] = useState<"completed" | "all" | "today">("completed");
  const [qbFormat, setQbFormat] = useState<"standard" | "iif">("standard");
  const [qbCopied, setQbCopied] = useState(false);

  // Fetch immutable audit ledger
  const fetchAuditLedger = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch("/api/jobs?audit=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.ledger)) {
        setAuditEntries(data.ledger);
      }
    } catch (e) {
      console.error("Failed to fetch audit ledger:", e);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Session State — lazy initializer reads URL param without triggering a cascading render
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get("session");
      if (s) return s;
    }
    return "demo-main";
  });

  const prevJobsMapRef = useRef<Map<string, string>>(new Map());
  const isFirstLoadRef = useRef(true);
  const alertedReservedRef = useRef<Set<string>>(new Set());
  const alertedCompletedRef = useRef<Set<string>>(new Set());

  // Auto-unlock audio on user gesture
  useEffect(() => {
    const unlockAudio = () => {
      getAudioContext();
      setAudioEnabled(true);
    };
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  // Real-time synchronization via Server-Sent Events (SSE) with fallback to polling
  useEffect(() => {
    let isMounted = true;
    let eventSource: EventSource | null = null;
    let pollInterval: any = null;

    const handleJobsUpdate = (updatedJobs: ReworkJob[]) => {
      if (!isMounted) return;
      const currentMap = new Map<string, string>();
      updatedJobs.forEach((j: ReworkJob) => currentMap.set(j.id, j.status));

      if (!isFirstLoadRef.current) {
        // Check for newly completed job or newly reserved job that hasn't already been announced
        const newlyCompleted = updatedJobs.find(
          (j: ReworkJob) =>
            j.status === "Completed" &&
            prevJobsMapRef.current.get(j.id) !== "Completed" &&
            prevJobsMapRef.current.get(j.id) !== "Billed" &&
            !alertedCompletedRef.current.has(j.id)
        );
        const newlyReserved = updatedJobs.find(
          (j: ReworkJob) =>
            j.status === "Reserved" &&
            !prevJobsMapRef.current.has(j.id) &&
            !alertedReservedRef.current.has(j.id)
        );

        const alertedJob = newlyCompleted || newlyReserved;
        if (alertedJob) {
          if (newlyReserved) {
            alertedReservedRef.current.add(newlyReserved.id);
          }
          if (newlyCompleted) {
            alertedCompletedRef.current.add(newlyCompleted.id);
          }
          setNewArrivalAlert(alertedJob);
          playNotificationChime();

          // Auto-hide alert after 8 seconds
          setTimeout(() => {
            setNewArrivalAlert((curr) => (curr?.id === alertedJob.id ? null : curr));
          }, 8000);
        }
      } else {
        // Mark all existing jobs on initial load as already alerted so no notifications fire on page load
        updatedJobs.forEach((j: ReworkJob) => {
          if (j.status === "Reserved") alertedReservedRef.current.add(j.id);
          if (j.status === "Completed" || j.status === "Billed") alertedCompletedRef.current.add(j.id);
        });
        isFirstLoadRef.current = false;
      }

      prevJobsMapRef.current = currentMap;
      setJobs(updatedJobs);
    };

    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/jobs?session=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.jobs)) {
          handleJobsUpdate(data.jobs);
        }
      } catch (err) {
        console.warn("Poll jobs error:", err);
      }
    };

    // Attempt real-time SSE stream connection
    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        const streamUrl = `/api/jobs/stream?session=${encodeURIComponent(sessionId)}`;
        eventSource = new EventSource(streamUrl);

        eventSource.addEventListener("init", (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (Array.isArray(data.jobs)) {
              handleJobsUpdate(data.jobs);
            }
          } catch {}
        });

        eventSource.addEventListener("job_update", (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (Array.isArray(data.jobs)) {
              handleJobsUpdate(data.jobs);
            } else if (data.job) {
              // Refresh full state on mutation
              fetchJobs();
            }
          } catch {}
        });

        eventSource.onerror = () => {
          // If SSE encounters an error or drops, fallback to interval polling
          if (!pollInterval) {
            pollInterval = setInterval(fetchJobs, 2500);
          }
        };
      } catch (e) {
        console.warn("SSE connection init failed, using polling:", e);
      }
    }

    // Always fetch once immediately
    fetchJobs();

    // Secondary safety poll every 5s to guarantee fresh hold expirations
    const safetyTimer = setInterval(fetchJobs, 5000);

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      clearInterval(safetyTimer);
    };
  }, [sessionId]);

  // Compute metrics with defensive numbers
  const completedJobs = jobs.filter((j) => j.status !== "Reserved");
  const totalRevenue = completedJobs.reduce((sum, j) => sum + Number(j.totalAmount || 0), 0);
  const activeBaysOccupied = Math.min(6, jobs.filter((j) => j.status === "Reserved" || j.status === "In Progress").length + 3);

  // Reset Demo (scoped to current session)
  const handleReset = async () => {
    try {
      const res = await fetch(`/api/jobs?session=${encodeURIComponent(sessionId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs)) {
        alertedReservedRef.current.clear();
        alertedCompletedRef.current.clear();
        const currentMap = new Map<string, string>();
        data.jobs.forEach((j: ReworkJob) => {
          currentMap.set(j.id, j.status);
          if (j.status === "Reserved") alertedReservedRef.current.add(j.id);
          if (j.status === "Completed" || j.status === "Billed") alertedCompletedRef.current.add(j.id);
        });
        prevJobsMapRef.current = currentMap;
        setJobs(data.jobs);
        setNewArrivalAlert(null);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  // Export CSV safely with RFC-4180 escaping and formula neutralization
  const getFilteredExportJobs = () => {
    return jobs.filter((j) => {
      if (qbFilter === "completed") {
        return j.status === "Completed" || j.status === "Billed";
      }
      if (qbFilter === "today") {
        const todayStr = new Date().toISOString().split("T")[0];
        return (j.createdAt && j.createdAt.startsWith(todayStr)) || (j.status === "Completed" || j.status === "Billed");
      }
      return true; // all
    });
  };

  const handleExportCSV = (overrideFormat?: "standard" | "iif") => {
    const activeFormat = overrideFormat || qbFormat;
    const targetJobs = getFilteredExportJobs();

    if (activeFormat === "iif") {
      // QuickBooks IIF Format (Intuit Interchange Format for direct desktop invoice batching)
      let iif = "!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO\tCLEAR\n";
      iif += "!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO\tCLEAR\n";
      iif += "!ENDTRNS\n";

      targetJobs.forEach((j) => {
        const dateFormatted = j.createdAt ? new Date(j.createdAt).toLocaleDateString("en-US") : new Date().toLocaleDateString("en-US");
        const total = Number(j.totalAmount ?? 0).toFixed(2);
        // Header Transaction line
        iif += `TRNS\tINVOICE\t${dateFormatted}\tAccounts Receivable\t${j.carrierName}\t${total}\t${j.id}\tRework Bay ${j.bayNumber} - Trailer ${j.trailerNumber}\tN\n`;
        // Split line for rework income
        iif += `SPL\tINVOICE\t${dateFormatted}\tFreight Rework & Cross-Dock Revenue\t${j.carrierName}\t-${total}\t${j.id}\t${j.serviceType} (${j.palletsCount} pallets, ${j.laborHours}h labor)\tN\n`;
        iif += "ENDTRNS\n";
      });

      const blob = new Blob([iif], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QuickBooks_Batch_Invoices_${new Date().toISOString().split("T")[0]}.iif`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Standard RFC-4180 QuickBooks Online / CSV Import format
    const headers = [
      "*InvoiceNo",
      "*Customer",
      "*InvoiceDate",
      "*DueDate",
      "Terms",
      "Item(Product/Service)",
      "ItemDescription",
      "ItemQuantity",
      "ItemRate",
      "*ItemAmount",
      "TrailerNumber",
      "AssignedBay",
      "DriverName",
      "DriverPhone",
      "PalletsUsed",
      "WrapRolls",
      "LaborHours",
      "ScaleTicket",
      "DisposalFee",
      "Status",
    ];

    let csv = headers.join(",") + "\n";
    targetJobs.forEach((j) => {
      const invDate = j.createdAt ? j.createdAt.split("T")[0] : new Date().toISOString().split("T")[0];
      // Due date Net 15
      const d = new Date(invDate);
      d.setDate(d.getDate() + 15);
      const dueDate = d.toISOString().split("T")[0];

      const row = [
        escapeCsvField(j.id),
        escapeCsvField(j.carrierName),
        escapeCsvField(invDate),
        escapeCsvField(dueDate),
        escapeCsvField("Net 15"),
        escapeCsvField(`Freight Rework: ${j.serviceType}`),
        escapeCsvField(`Trailer ${j.trailerNumber} • Bay ${j.bayNumber} • Driver ${j.driverName} • Shift / Rework Services`),
        escapeCsvField("1"),
        escapeCsvField(Number(j.totalAmount ?? 0).toFixed(2)),
        escapeCsvField(Number(j.totalAmount ?? 0).toFixed(2)),
        escapeCsvField(j.trailerNumber),
        escapeCsvField(j.bayNumber),
        escapeCsvField(j.driverName),
        escapeCsvField(j.driverPhone),
        escapeCsvField(j.palletsCount),
        escapeCsvField(j.wrapCount),
        escapeCsvField(Number(j.laborHours ?? 0).toFixed(2)),
        escapeCsvField(j.scaleCheck ? "Yes ($35)" : "No"),
        escapeCsvField(j.debrisFee ? "Yes ($45)" : "No"),
        escapeCsvField(j.status),
      ];
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Denver_Express_QuickBooks_Invoices_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboardCSV = () => {
    const targetJobs = getFilteredExportJobs();
    const headers = ["InvoiceNo", "Customer", "InvoiceDate", "DueDate", "Service", "Trailer", "Bay", "TotalAmount", "Status"];
    let text = headers.join("\t") + "\n";
    targetJobs.forEach((j) => {
      const invDate = j.createdAt ? j.createdAt.split("T")[0] : new Date().toISOString().split("T")[0];
      text += `${j.id}\t${j.carrierName}\t${invDate}\tNet 15\t${j.serviceType}\t${j.trailerNumber}\t${j.bayNumber}\t$${Number(j.totalAmount || 0).toFixed(2)}\t${j.status}\n`;
    });
    navigator.clipboard.writeText(text);
    setQbCopied(true);
    setTimeout(() => setQbCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-100 flex flex-col font-sans">
      
      {/* NEW ARRIVAL FLOATING TOAST / BANNER */}
      {newArrivalAlert && (
        <div className={`fixed top-16 right-6 z-50 max-w-md w-full bg-slate-900 border-2 ${newArrivalAlert.status === "Reserved" ? "border-amber-400" : "border-emerald-400"} text-white p-4 rounded-2xl shadow-2xl shadow-black/80 flex items-start justify-between gap-3 animate-bounce`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${newArrivalAlert.status === "Reserved" ? "bg-amber-500 text-slate-950" : "bg-emerald-500 text-slate-950"} flex items-center justify-center font-black shrink-0`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${newArrivalAlert.status === "Reserved" ? "bg-amber-400 text-slate-950" : "bg-emerald-400 text-slate-950"} font-bold uppercase`}>
                  {newArrivalAlert.status === "Reserved" ? "Pre-Arrival Bay Hold" : "Live Sync from Dock"}
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">{newArrivalAlert.id}</span>
              </div>
              <h4 className="font-bold text-sm text-white mt-1">
                {newArrivalAlert.status === "Reserved"
                  ? `Trailer ${newArrivalAlert.trailerNumber} Reserved ${newArrivalAlert.bayNumber}!`
                  : `Trailer ${newArrivalAlert.trailerNumber} Completed!`}
              </h4>
              <p className="text-xs text-slate-300">
                {newArrivalAlert.carrierName} • {newArrivalAlert.status === "Reserved" ? <>ETA: <ArrivalEta eta={newArrivalAlert.eta} createdAt={newArrivalAlert.createdAt} /></> : newArrivalAlert.bayNumber}
              </p>
              <div className="text-xs font-mono font-bold text-[#d4af37] mt-1">
                {newArrivalAlert.status === "Reserved" ? `Estimated: $${Number(newArrivalAlert.totalAmount || 0).toFixed(2)}` : `+$${Number(newArrivalAlert.totalAmount || 0).toFixed(2)} Ready to Bill`}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setNewArrivalAlert(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
            {newArrivalAlert.status !== "Reserved" && (
              <button
                onClick={() => {
                  setActiveJob(newArrivalAlert);
                  setNewArrivalAlert(null);
                }}
                className="px-3 py-1 bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold hover:bg-emerald-300 transition"
              >
                View Packet
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="bg-[#0b192c] border-b border-[#233f63] sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          {/* Brand & Terminal Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#d4af37] text-[#0b192c] flex items-center justify-center font-black text-base sm:text-lg shrink-0 shadow">
                DE
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="font-bold text-sm sm:text-lg text-white leading-tight">Denver Express Warehousing</h1>
                  <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-[#162b45] text-blue-400 border border-[#233f63] font-semibold">
                    Office Board
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400">Terminal 6030 Washington St, Ste 130 • I-25 & I-70 Hub</p>
              </div>
            </div>

            {/* Live Indicator (visible on mobile next to brand) */}
            <div className="md:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live (1.5s)
            </div>
          </div>

          {/* Controls / Session / Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap pt-1 md:pt-0 border-t md:border-t-0 border-[#233f63]/60">
            {/* Live sync pill (desktop/tablet) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync (1.5s)
            </div>

            <div className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg bg-[#162b45] text-slate-300 border border-[#233f63] font-mono flex items-center gap-1">
              <span className="text-slate-400">Session:</span>
              <span className="text-[#d4af37] font-bold truncate max-w-[90px] sm:max-w-none">{sessionId}</span>
            </div>

            {/* Audio toggle button */}
            <button
              onClick={() => {
                playNotificationChime();
                setAudioEnabled(true);
              }}
              className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg border border-[#233f63] text-slate-300 hover:text-white bg-[#162b45] flex items-center gap-1"
              title="Test audio chime"
            >
              <span>🔊 {audioEnabled ? "Sound On" : "Test Chime"}</span>
            </button>

            <Link
              href={sessionId ? `/dock?session=${encodeURIComponent(sessionId)}` : "/dock"}
              target="_blank"
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-[#162b45] hover:bg-[#233f63] text-[#d4af37] border border-[#233f63] text-[11px] sm:text-xs font-bold transition flex items-center gap-1.5 ml-auto sm:ml-0"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Dock View</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Board Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <PhoneIntake key={sessionId} sessionId={sessionId} onCreated={(job) => setJobs(current => [job, ...current.filter(existing => existing.id !== job.id)])} />

        {/* Demo Controller Info Banner */}
        <div className="bg-[#0f2238] border border-[#233f63] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-bold block">Live Pitch Setup:</span>
              <span className="text-slate-300">
                Keep this laptop screen visible. On your smartphone, navigate to <code className="text-[#d4af37] font-mono font-bold">{`/dock?session=${sessionId}`}</code>. When you tap &quot;Dispatch Certificate&quot; on your phone, this board updates instantly!
              </span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white underline flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Jobs</span>
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#0f2238] border border-[#233f63] rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Today&apos;s Rework Billing</span>
            <span className="text-3xl font-black text-[#d4af37] mt-1 block font-mono">
              ${Number(totalRevenue || 0).toFixed(2)}
            </span>
            <span className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {completedJobs.length} trailers serviced today
            </span>
          </div>

          <div className="bg-[#0f2238] border border-[#233f63] rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Bay Occupancy</span>
            <span className="text-3xl font-black text-white mt-1 block font-mono">
              {activeBaysOccupied} / 6
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Bays 1 & 3 currently available
            </span>
          </div>

          <div className="bg-[#0f2238] border border-[#233f63] rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Carrier Dispute Rate</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block font-mono">
              0.0%
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Illustrative only · not a measured dispute rate
            </span>
          </div>

          <div className="bg-[#0f2238] border border-[#233f63] rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Turnaround Time</span>
            <span className="text-3xl font-black text-blue-400 mt-1 block font-mono">
              52 min
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Illustrative only · not measured turnaround
            </span>
          </div>

        </div>

        {/* Rework Activity Table */}
        <div className="bg-[#0f2238] border border-[#233f63] rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Table Header Controls */}
          <div className="p-5 border-b border-[#233f63] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Denver Express Live Operations Log</h3>
              <p className="text-xs text-slate-400">Terminal 6030 Washington St • Completion records for review</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchAuditLedger();
                  setAuditModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 text-xs font-bold text-[#d4af37] transition flex items-center gap-2 shadow-sm"
                title="View cryptographically chained, immutable forensic audit ledger"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Immutable Audit Ledger</span>
              </button>

              <button
                onClick={() => setQbModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
                title="Open QuickBooks Batch Invoicing & Closeout Center"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>QuickBooks Batch Billing</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0b192c] text-xs uppercase text-slate-400 font-semibold border-b border-[#233f63]">
                <tr>
                  <th className="py-3.5 px-4">Job ID</th>
                  <th className="py-3.5 px-4">Trailer / Carrier</th>
                  <th className="py-3.5 px-4">Bay</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Supplies Logged</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Audit Packet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233f63]/60 text-xs sm:text-sm">
                {jobs.map((job, idx) => (
                  <tr
                    key={job.id}
                    className={`hover:bg-[#162b45]/50 transition ${idx === 0 ? "bg-[#162b45]/20" : ""}`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#d4af37]">
                      {job.id}
                      {idx === 0 && (
                        <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold border border-emerald-500/30">
                          NEWEST
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono">{job.trailerNumber}</div>
                      {job.phoneIntake && <div className="mt-1 text-xs text-slate-300">Phone request{job.phoneIntake.notes ? ` · ${job.phoneIntake.notes}` : ""}</div>}
                      <div className="text-xs text-slate-400">{job.carrierName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#0b192c] border border-[#233f63] font-mono text-xs text-slate-200">
                        {job.bayNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {job.serviceType}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {job.palletsCount} Pallets • {job.wrapCount} Wrap • {Number(job.laborHours || 0).toFixed(2)}h Labor
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white text-base">
                      {job.estimatedRange === "Pending assessment" && job.status === "Reserved" ? "Pending assessment" : `$${Number(job.totalAmount || 0).toFixed(2)}`}
                    </td>
                    <td className="py-3.5 px-4">
                      {job.status === "Reserved" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-fit animate-pulse">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Incoming Hold (ETA <ArrivalEta eta={job.eta} createdAt={job.createdAt} />)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          {job.status === "In Progress" ? "In Progress" : job.status === "Billed" ? "Billed" : "Signed & Dispatched"}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {job.status === "Reserved" || job.status === "In Progress" ? (
                        <span className="text-xs text-amber-400 font-mono font-semibold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                          {job.status === "Reserved" ? "Bay Held" : "Work underway"}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            startTransition(() => {
                              setActiveJob(job);
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 font-bold text-xs transition cursor-pointer active:scale-95"
                        >
                          View Certificate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* ========================================================= */}
      {/* MODAL: PRINTABLE REWORK CERTIFICATE & EVIDENCE PACKET    */}
      {/* ========================================================= */}
      {activeJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-300">
            
            {/* Modal Non-Print Bar */}
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between no-print border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-sm">Certificate #{activeJob.id} — Completion Packet</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Defer print invocation so the click interaction finishes immediately and doesn't block INP
                    setTimeout(() => {
                      window.print();
                    }, 50);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setActiveJob(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div id="certificate-print-area" className="p-8 space-y-6 text-slate-900 bg-white">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm">
                      DE
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Denver Express</h2>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">Warehousing, Cross-Docking & Freight Rework</p>
                  <p className="text-xs text-slate-600">6030 Washington St, Suite 130 • Denver, CO 80216 • (303) 289-4343</p>
                  <p className="text-[11px] text-slate-500">DEMONSTRATION CERTIFICATE · FICTIONAL WORK RECORD</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-slate-100 border border-slate-300 rounded px-3 py-1 font-mono text-xs font-bold text-slate-900">
                    CERTIFICATE #{activeJob.id}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Date: {new Date(activeJob.createdAt).toLocaleDateString()} • {new Date(activeJob.createdAt).toLocaleTimeString()} MT
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-0.5">● STATUS: DEMO COMPLETED</div>
                </div>
              </div>

              {/* Load Metadata Block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Trailer #</span>
                  <span className="font-mono font-bold text-sm text-slate-900">{activeJob.trailerNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Carrier</span>
                  <span className="font-bold text-sm text-slate-900">{activeJob.carrierName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Assigned Bay</span>
                  <span className="font-bold text-sm text-slate-900">{activeJob.bayNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Driver Name</span>
                  <span className="font-bold text-sm text-slate-900">{activeJob.driverName}</span>
                </div>
              </div>

              {/* Photo Evidence Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Photographic Audit Evidence (Before & After)</span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                    Record timestamps shown in Mountain Time · Location not captured
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="border border-red-200 rounded-lg p-2.5 bg-red-50/40">
                    <div className="flex items-center justify-between text-[11px] font-bold text-red-700 mb-1.5">
                      <span>BEFORE: Inbound Shift Condition</span>
                      <span className="text-[10px] bg-red-200 text-red-800 px-1 rounded">REJECTED</span>
                    </div>
                    {activeJob.beforePhotos?.[0] && activeJob.beforePhotos?.[1] ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="relative">
                          <img
                            src={activeJob.beforePhotos[0]}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-36 object-cover rounded border border-slate-300"
                            alt="Wide truck interior shift"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/75 text-[9px] text-amber-300 px-1 py-0.5 rounded font-mono font-bold">
                            Wide • Denver MT
                          </span>
                        </div>
                        <div className="relative">
                          <img
                            src={activeJob.beforePhotos[1]}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-36 object-cover rounded border border-slate-300"
                            alt="Busted runner close-up"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/75 text-[9px] text-rose-300 px-1 py-0.5 rounded font-mono font-bold">
                            Runner • Denver MT
                          </span>
                        </div>
                      </div>
                    ) : activeJob.beforePhotos?.[0] ? (
                      <img
                        src={activeJob.beforePhotos[0]}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-36 object-cover rounded border border-slate-300"
                        alt="Before damage"
                      />
                    ) : (
                      <div className="w-full h-36 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">No Photo</div>
                    )}
                    <div className="mt-1.5 text-[10px] text-slate-600">
                      <span>Example notes: Mountain shift; leaning cargo; broken runners.</span>
                    </div>
                  </div>

                  {/* After */}
                  <div className="border border-emerald-200 rounded-lg p-2.5 bg-emerald-50/40">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 mb-1.5">
                      <span>AFTER: Restacked & Banded</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 rounded">ROAD-READY</span>
                    </div>
                    {activeJob.afterPhotos?.[0] ? (
                      <div className="relative">
                        <img
                          src={activeJob.afterPhotos[0]}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-36 object-cover rounded border border-slate-300"
                          alt="After rework"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/75 text-[9px] text-emerald-300 px-1 py-0.5 rounded font-mono font-bold">
                          Road-Ready • Denver MT
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-36 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">No Photo</div>
                    )}
                    <div className="mt-1.5 text-[10px] text-slate-600">
                      <span>Example notes: Restacked, banded and shrinkwrapped.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Charges Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Itemized Materials & Labor Invoice</h4>
                <table className="w-full text-left text-xs border border-slate-200 rounded overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-2 border-b">Description</th>
                      <th className="p-2 border-b text-center">Qty</th>
                      <th className="p-2 border-b text-right">Unit Price</th>
                      <th className="p-2 border-b text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-medium">New GMA Grade-A Pallets</td>
                      <td className="p-2 text-center">{activeJob.palletsCount}</td>
                      <td className="p-2 text-right">${RATES.pallets.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">${(Number(activeJob.palletsCount || 0) * RATES.pallets).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Heavy Stretch Wrap Rolls (80ga)</td>
                      <td className="p-2 text-center">{activeJob.wrapCount}</td>
                      <td className="p-2 text-right">${RATES.wrap.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">${(Number(activeJob.wrapCount || 0) * RATES.wrap).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Corner Boards (48&quot; protection)</td>
                      <td className="p-2 text-center">{activeJob.cornersCount}</td>
                      <td className="p-2 text-right">${RATES.corners.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">${(Number(activeJob.cornersCount || 0) * RATES.corners).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Forklift Operator & Dock Crew Labor</td>
                      <td className="p-2 text-center">{Number(activeJob.laborHours || 0).toFixed(2)} hrs</td>
                      <td className="p-2 text-right">${RATES.labor.toFixed(2)}/hr</td>
                      <td className="p-2 text-right font-mono">${(Number(activeJob.laborHours || 0) * RATES.labor).toFixed(2)}</td>
                    </tr>
                    {activeJob.scaleCheck && (
                      <tr>
                        <td className="p-2 font-medium">Pallet Weight Check</td>
                        <td className="p-2 text-center">1</td>
                        <td className="p-2 text-right">${RATES.scale.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">${RATES.scale.toFixed(2)}</td>
                      </tr>
                    )}
                    {activeJob.debrisFee && (
                      <tr>
                        <td className="p-2 font-medium">Broken Pallet & Dunnage Disposal Fee</td>
                        <td className="p-2 text-center">1</td>
                        <td className="p-2 text-right">${RATES.debris.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">${RATES.debris.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="p-2 text-right uppercase text-slate-600">Total Settlement Due:</td>
                      <td className="p-2 text-right text-sm font-mono text-slate-950">${Number(activeJob.totalAmount || 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signature Block */}
              <div className="border-t border-slate-300 pt-4 grid grid-cols-2 gap-6 items-end">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Driver Digital Attestation (Signed on Glass)</span>
                  <div className="h-20 bg-slate-50 border border-slate-300 rounded p-1 flex items-center justify-center">
                    {activeJob.signatureData ? (
                      <img src={activeJob.signatureData} className="max-h-full max-w-full" alt="Driver signature" />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Signature on file</span>
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>Driver: <strong>{activeJob.driverName}</strong></span>
                    <span>Demo SMS preview (not sent): {activeJob.driverPhone}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 space-y-1">
                  <p><strong>Denver Express Warehousing & Cross-Docking</strong></p>
                  <p>Dock Superintendent: Craig / Steve Chapman</p>
                  <p className="text-[10px] text-slate-400">System generated via Yorkstead ReworkFlow v1.0</p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs text-slate-600 font-medium">
                Demonstration only. SMS and email delivery are not connected.
              </span>
              <button
                onClick={() => setActiveJob(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                Close Certificate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* IMMUTABLE AUDIT LEDGER MODAL */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#0b192c] border border-[#233f63] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#233f63] flex items-center justify-between bg-[#0f2238]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Cryptographic Immutable Audit Ledger</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      SHA-256 Chained
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Append-only permanent log • Never overwritten, deleted, or altered
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAuditModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="p-3.5 bg-[#060d17] border border-[#233f63] rounded-xl text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#d4af37]" />
                  <span>Total Recorded Ledger Blocks: <strong className="text-white font-mono">{auditEntries.length}</strong></span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Chain Status: <strong className="text-emerald-400">VALIDATED &amp; LOCKED</strong>
                </span>
              </div>

              {loadingAudit ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Loading cryptographic audit ledger...
                </div>
              ) : auditEntries.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No audit blocks logged yet. Creating a reservation or dispatching a job writes the first immutable entry.
                </div>
              ) : (
                <div className="space-y-3">
                  {auditEntries.map((entry, idx) => (
                    <div
                      key={entry.entryId}
                      className="bg-[#060d17] border border-[#233f63] hover:border-[#d4af37]/60 rounded-xl p-4 space-y-2.5 transition font-mono"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#162b45] text-[#d4af37] font-black flex items-center justify-center text-[10px]">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-white text-sm">{entry.entryId}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            entry.action === "JOB_COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : entry.action === "JOB_RESERVED"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}>
                            {entry.action}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 bg-[#0f2238]/60 p-2.5 rounded-lg border border-[#233f63]/50">
                        <div>
                          <span className="text-slate-400 block text-[10px]">TRAILER / CARRIER</span>
                          <strong className="text-white">{entry.trailerNumber}</strong> ({entry.carrierName})
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">DRIVER &amp; BAY</span>
                          {entry.driverName} • <strong className="text-[#d4af37]">{entry.bayNumber}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">SETTLEMENT</span>
                          <strong className="text-emerald-400">${Number(entry.totalAmount || 0).toFixed(2)}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">FORENSIC PROOF</span>
                          <span>{entry.hasSignature ? "✓ Driver Glass Sig" : "No Sig"} • {entry.photoCount} Photos</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px] text-slate-400 pt-1">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-400 uppercase w-16 shrink-0">Prev Hash:</span>
                          <span className="text-slate-400 truncate">{entry.prevHash}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-emerald-400 uppercase font-bold w-16 shrink-0">Block Hash:</span>
                          <span className="text-emerald-300 font-bold truncate">{entry.hash}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#233f63] bg-[#0f2238] flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Written to disk ledger at <code className="text-[#d4af37]">.data/immutable-audit-ledger.jsonl</code> &amp; replicated to cloud storage.
              </span>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICKBOOKS BATCH INVOICING & CLOSEOUT CENTER MODAL */}
      {qbModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#0b192c] border border-[#233f63] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#233f63] flex items-center justify-between bg-[#0f2238]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">QuickBooks Batch Invoicing &amp; Closeout</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Accounting Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Preview accounting export files. Validate the mapping with your accountant before importing into QuickBooks.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setQbModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Batch Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#060d17] border border-[#233f63] rounded-xl p-3.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Eligible Invoices</span>
                  <span className="text-2xl font-black text-white mt-0.5 block font-mono">
                    {getFilteredExportJobs().length}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {qbFilter === "completed" ? "Signed & Dispatched only" : qbFilter === "today" ? "Today's shift reworks" : "All session records"}
                  </span>
                </div>

                <div className="bg-[#060d17] border border-[#233f63] rounded-xl p-3.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Receivables Volume</span>
                  <span className="text-2xl font-black text-[#d4af37] mt-0.5 block font-mono">
                    ${getFilteredExportJobs().reduce((sum, j) => sum + Number(j.totalAmount || 0), 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">
                    Recorded sign-offs for office review
                  </span>
                </div>

                <div className="bg-[#060d17] border border-[#233f63] rounded-xl p-3.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Payment Terms</span>
                  <span className="text-2xl font-black text-blue-400 mt-0.5 block font-mono">
                    Net 15
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Pre-populated invoice due dates
                  </span>
                </div>
              </div>

              {/* Filter & Period Controls */}
              <div className="bg-[#0f2238] border border-[#233f63] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Select Export Scope:</span>
                  </span>
                  <div className="flex items-center gap-1 bg-[#060d17] p-1 rounded-lg border border-[#233f63] text-xs">
                    <button
                      onClick={() => setQbFilter("completed")}
                      className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                        qbFilter === "completed"
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Completed Only ({jobs.filter((j) => j.status === "Completed" || j.status === "Billed").length})
                    </button>
                    <button
                      onClick={() => setQbFilter("today")}
                      className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                        qbFilter === "today"
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Today&apos;s Shift
                    </button>
                    <button
                      onClick={() => setQbFilter("all")}
                      className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                        qbFilter === "all"
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      All Records ({jobs.length})
                    </button>
                  </div>
                </div>

                {/* Target Format Selector */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#233f63]/60">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>QuickBooks Target Platform:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="qbFormat"
                        checked={qbFormat === "standard"}
                        onChange={() => setQbFormat("standard")}
                        className="accent-emerald-500 cursor-pointer"
                      />
                      <span>QuickBooks Online (QBO CSV)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer ml-3">
                      <input
                        type="radio"
                        name="qbFormat"
                        checked={qbFormat === "iif"}
                        onChange={() => setQbFormat("iif")}
                        className="accent-emerald-500 cursor-pointer"
                      />
                      <span>QuickBooks Desktop (.IIF Batch)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Invoicing Workflow Guide */}
              <div className="bg-[#060d17] border border-[#233f63] rounded-xl p-4 text-xs text-slate-300 space-y-2.5">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>When &amp; How the Office Runs This:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                  <div className="bg-[#0f2238]/60 p-2.5 rounded-lg border border-[#233f63]/50">
                    <strong className="text-emerald-400 block mb-1">1. Daily Closeout (5:00 PM)</strong>
                    <span>Click <em>Export Batch CSV</em> at end of shift to import the day&apos;s completed reworks into QuickBooks AR in one batch.</span>
                  </div>
                  <div className="bg-[#0f2238]/60 p-2.5 rounded-lg border border-[#233f63]/50">
                    <strong className="text-blue-400 block mb-1">2. Weekly Net 15 Billing</strong>
                    <span>Filter by carrier (e.g. Swift or Knight) every Friday to bundle statement invoices for contract carriers.</span>
                  </div>
                  <div className="bg-[#0f2238]/60 p-2.5 rounded-lg border border-[#233f63]/50">
                    <strong className="text-amber-400 block mb-1">3. Dispute Attachment</strong>
                    <span>Pair each invoice row with the signed PDF Certificate from the table to prevent freight broker claims.</span>
                  </div>
                </div>
              </div>

              {/* Live Preview of Batch Rows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Preview Batch Invoices ({getFilteredExportJobs().length} items):</span>
                  <button
                    onClick={handleCopyClipboardCSV}
                    className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {qbCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3" />}
                    <span>{qbCopied ? "Copied to Clipboard!" : "Copy Table to Clipboard"}</span>
                  </button>
                </div>
                <div className="border border-[#233f63] rounded-xl overflow-hidden bg-[#060d17] max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-[#0f2238] text-slate-400 uppercase text-[10px] border-b border-[#233f63]">
                      <tr>
                        <th className="p-2">Invoice #</th>
                        <th className="p-2">Customer / Carrier</th>
                        <th className="p-2">Service</th>
                        <th className="p-2">Trailer</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#233f63]/40 text-slate-300">
                      {getFilteredExportJobs().map((j) => (
                        <tr key={j.id} className="hover:bg-[#162b45]/40">
                          <td className="p-2 font-bold text-[#d4af37]">{j.id}</td>
                          <td className="p-2 text-white font-sans truncate max-w-[140px]">{j.carrierName}</td>
                          <td className="p-2 text-slate-300 font-sans">{j.serviceType}</td>
                          <td className="p-2 text-slate-400">{j.trailerNumber}</td>
                          <td className="p-2 text-right font-bold text-emerald-400">${Number(j.totalAmount || 0).toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {j.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#233f63] bg-[#0f2238] flex items-center justify-between flex-wrap gap-3">
              <span className="text-[11px] text-slate-400">
                Columns mapped to standard QuickBooks <code className="text-emerald-400">*InvoiceNo, *Customer, *InvoiceDate, *ItemAmount</code>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQbModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleExportCSV();
                    setQbModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {qbFormat === "iif" ? "QuickBooks IIF File" : "QuickBooks CSV File"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

