"use client";

import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { StatusBadge, PriorityBadge, SeverityBadge } from "@/components/operations/StatusBadge";
import {
  TrendingUp,
  Truck,
  Building2,
  AlertTriangle,
  Boxes,
  ArrowRight,
  Clock,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function CommandCenterPage() {
  const { jobs, trailers, locations, exceptions } = useWarehouseStore();

  const dockDoors = locations.filter((l) => l.id.startsWith("D-"));
  const occupiedDoors = dockDoors.filter((d) => d.status === "full" || d.status === "partial").length;
  const activeJobs = jobs.filter((j) => j.status !== "completed");
  const unbilledRevenue = jobs
    .filter((j) => j.billingStatus === "unbilled" || j.billingStatus === "pending_review")
    .reduce((acc, j) => acc + j.billableAmount, 0);

  const pendingExceptions = exceptions.filter((e) => e.approvalStatus === "pending");
  const waitingTrailers = trailers.filter((t) => t.loadStatus === "waiting");

  return (
    <div className="space-y-6">
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Executive Overview • 60,000 Sq. Ft. Facility
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Denver Terminal Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time yard queue, active dock assignments, and freight rework triage at I-25 &amp; I-70.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operations/jobs?job=DX-260918-037"
            className="px-3.5 py-2 rounded-lg bg-[#162b45] hover:bg-[#1f3b5f] border border-[#233f63] text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
          >
            <span className="text-[#d4af37]">★ Flagship Job:</span>
            <span>DX-260918-037</span>
          </Link>
          <Link
            href="/operations/jobs"
            className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <span>+ Work Order Intake</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 4 Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Active Work Orders</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{activeJobs.length}</span>
            <span className="text-xs text-blue-400 font-semibold">in process</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{jobs.filter((j) => j.status === "in_progress").length} active in rework</span>
            <span className="font-mono text-slate-500">{waitingTrailers.length} waiting</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Dock Utilization</span>
            <Building2 className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#d4af37]">{occupiedDoors} / 6</span>
            <span className="text-xs text-slate-400 font-semibold">doors occupied</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Doors 2, 3, 4, 5 active • Doors 1 &amp; 6 staged
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Exception Holds</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400">{pendingExceptions.length}</span>
            <span className="text-xs text-rose-300 font-semibold">need approval</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-400/90 font-medium truncate">
            EX-1049: RMB-5012 I-70 shift (+$285)
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Unbilled Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              ${unbilledRevenue.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {jobs.filter((j) => j.billingStatus === "pending_review").length} orders ready for QuickBooks export
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Attention Required Critical Alert Strip */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-[#0b192c] to-[#0b192c] border border-rose-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-black uppercase tracking-wider text-rose-300">
              Attention Required — 3 Operational Action Items
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Live Dispatch Triage</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Action 1: Flagship exception */}
          {(() => {
            const ex1049 = exceptions.find((e) => e.id === "EX-1049");
            const isApproved = ex1049?.status === "approved";
            const isInProgress = ex1049?.status === "in_progress";
            const isResolved = ex1049?.status === "resolved";

            return (
              <Link
                href={isApproved || isInProgress ? "/operations/jobs?job=DX-260918-037" : "/approval/EX-1049"}
                className={`p-3 rounded-lg bg-[#060d17]/80 hover:bg-[#122238] border transition flex flex-col justify-between group ${
                  isApproved
                    ? "border-emerald-500/40 hover:border-emerald-400"
                    : isInProgress
                    ? "border-amber-500/40 hover:border-amber-400"
                    : isResolved
                    ? "border-emerald-500/30"
                    : "border-rose-500/40 hover:border-rose-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-bold ${isApproved || isResolved ? "text-emerald-400" : isInProgress ? "text-amber-400" : "text-rose-400"}`}>
                      DX-260918-037
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        isApproved
                          ? "text-emerald-300 bg-emerald-500/20"
                          : isInProgress
                          ? "text-amber-300 bg-amber-500/20"
                          : isResolved
                          ? "text-emerald-300 bg-emerald-500/20"
                          : "text-rose-300 bg-rose-500/20"
                      }`}
                    >
                      {isApproved
                        ? "Authorized (+$285)"
                        : isInProgress
                        ? "Rework Active (RW-01)"
                        : isResolved
                        ? "Rework Complete"
                        : "Approval Pending"}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white mt-1.5">Rocky Mountain Beverage Co</div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                    {isApproved
                      ? "Change order authorized for $285. Rebuild queued for warehouse techs in Bay RW-01."
                      : isInProgress
                      ? "Technician Dave M. rebuilding Pallet P08 with Grade-A GMA exchange pallet in Bay RW-01."
                      : isResolved
                      ? "Pallet P08 restack & plumb laser inspection passed (<1°). Relocated to Bay ST-03."
                      : "Pallet P08 leaned >15° after I-70 Floyd Hill descent. +$285 change order awaiting customer sign-off."}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-[#d4af37] font-semibold group-hover:underline">
                  <span>{isApproved ? "Begin Corrective Work →" : isInProgress ? "Inspect Bay RW-01 →" : "Open Customer Approval Link"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })()}

          {/* Action 2: Yard Dwell Alert */}
          <Link
            href="/operations/yard"
            className="p-3 rounded-lg bg-[#060d17]/80 hover:bg-[#122238] border border-amber-500/40 hover:border-amber-400 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400">WRNR-88214 (Y-03)</span>
                <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                  Detention Warning
                </span>
              </div>
              <div className="font-bold text-xs text-white mt-1.5">Werner Enterprises • Cross-Dock</div>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                Driver Steve Miller checked in 1h 48m ago. Approaching 2-hour detention threshold. Door 6 ready for back-in.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-[#d4af37] font-semibold group-hover:underline">
              <span>Assign Door in Yard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 3: Ready for Billing */}
          <Link
            href="/operations/jobs?job=DX-260918-033"
            className="p-3 rounded-lg bg-[#060d17]/80 hover:bg-[#122238] border border-emerald-500/40 hover:border-emerald-400 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">DX-260918-033 (Door 2)</span>
                <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  Billing Review
                </span>
              </div>
              <div className="font-bold text-xs text-white mt-1.5">Swift Transportation • Pallet Swap</div>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                12 CHEP pallets exchanged. Driver Bill Vance signed inspection. $650.00 ready for dispatch invoice export.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-[#d4af37] font-semibold group-hover:underline">
              <span>Export to QuickBooks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Dock Status Grid (Doors 1 to 6) */}
      <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#d4af37]" />
              <span>Active Dock Bays (Doors 1 – 6)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live bay assignments and forklift terminal statuses. Click door to inspect work order.
            </p>
          </div>
          <Link
            href="/operations/dock"
            className="text-xs text-[#d4af37] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Full Dock Operations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {dockDoors.map((door) => {
            const assignedJob = jobs.find(
              (j) => j.dockDoor && (door.name.includes(j.dockDoor) || j.dockDoor.includes(door.name))
            );
            const isFull = door.status === "full";
            const isPartial = door.status === "partial";

            return (
              <div
                key={door.id}
                className={`p-3.5 rounded-lg border flex flex-col justify-between transition ${
                  assignedJob?.id === "DX-260918-037"
                    ? "bg-[#182e4b] border-[#d4af37] shadow-lg shadow-amber-500/10 ring-1 ring-[#d4af37]/40"
                    : isFull
                    ? "bg-[#162b45] border-amber-500/40"
                    : isPartial
                    ? "bg-[#12243a] border-blue-500/40"
                    : "bg-[#060d17]/50 border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{door.name.replace("Dock ", "")}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isFull ? "bg-amber-400 animate-pulse" : isPartial ? "bg-blue-400" : "bg-emerald-500"
                      }`}
                    />
                  </div>

                  {assignedJob ? (
                    <div className="mt-2.5">
                      <div className="text-[10px] uppercase font-bold text-[#d4af37] truncate">
                        {assignedJob.service}
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5 truncate">
                        {assignedJob.trailer}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {assignedJob.carrier.name}
                      </div>
                      {assignedJob.id === "DX-260918-037" && (
                        <span className="inline-block mt-1 text-[9px] font-bold text-[#d4af37] uppercase bg-amber-500/15 border border-amber-500/30 px-1 rounded">
                          Flagship Job
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 text-[11px] text-slate-500 font-medium">
                      Door Available
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  {assignedJob ? (
                    <>
                      <Link
                        href={`/operations/jobs?job=${assignedJob.id}`}
                        className="text-slate-300 font-semibold hover:text-[#d4af37] transition"
                      >
                        {assignedJob.palletCount} Plts →
                      </Link>
                      <Link
                        href="/dock"
                        target="_blank"
                        className="text-[#d4af37] font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>Tablet</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500">Ready</span>
                      <Link href="/operations/yard" className="text-slate-400 hover:text-white font-medium">
                        Assign →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two Columns: Active Work Orders + Exception / Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Work Orders Queue */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Active Work Order Pipeline</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current trailers undergoing rework, transload, and cross-docking.
              </p>
            </div>
            <Link
              href="/operations/jobs"
              className="text-xs text-[#d4af37] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#1a3353] overflow-hidden">
            {jobs.slice(0, 5).map((job) => {
              const isFlagship = job.id === "DX-260918-037";
              return (
                <div
                  key={job.id}
                  className={`py-3 px-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    isFlagship ? "bg-[#102237] border border-[#d4af37]/30" : "hover:bg-[#0f2136]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#162b45] border border-[#233f63] flex items-center justify-center font-mono text-xs font-bold text-[#d4af37] shrink-0">
                      {job.dockDoor ? job.dockDoor.replace("Door ", "D") : "YD"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{job.id}</span>
                        {isFlagship && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-[#d4af37] border border-amber-500/40">
                            ★ Flagship Scenario
                          </span>
                        )}
                        <PriorityBadge priority={job.priority} />
                        <span className="text-xs font-semibold text-slate-300">{job.service}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        <span>{job.carrier.name}</span>
                        <span className="mx-1.5">•</span>
                        <span>Trl {job.trailer}</span>
                        <span className="mx-1.5">•</span>
                        <span>{job.palletCount} Pallets</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:self-center">
                    <StatusBadge status={job.status} />
                    <span className="font-mono text-xs font-bold text-emerald-400 w-20 text-right">
                      ${job.billableAmount.toFixed(2)}
                    </span>
                    <Link
                      href={`/operations/jobs?job=${job.id}`}
                      className="p-1.5 rounded hover:bg-[#162b45] text-slate-400 hover:text-white transition"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: High-Priority Exceptions & Quick Actions */}
        <div className="space-y-6">
          {/* Exceptions Panel */}
          <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Exception Alerts</span>
              </h2>
              <Link
                href="/operations/exceptions"
                className="text-xs text-[#d4af37] hover:underline font-semibold"
              >
                Triage ({exceptions.length})
              </Link>
            </div>

            <div className="space-y-3">
              {exceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-lg bg-[#060d17] border border-[#233f63] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-300">{ex.id}</span>
                    <SeverityBadge severity={ex.severity} />
                  </div>
                  <div className="font-bold text-white">{ex.title}</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {ex.description}
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Job {ex.jobId}</span>
                    {ex.customerApprovalRequired && ex.approvalStatus === "pending" ? (
                      <Link
                        href={`/operations/jobs?job=${ex.jobId}`}
                        className="text-rose-400 font-bold hover:underline"
                      >
                        Approval Pending →
                      </Link>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Authorized</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Rework Flow Module Access */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#0f2238] to-[#0b192c] border border-[#233f63] space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#d4af37]" />
              <h3 className="text-sm font-black text-white">Rework Flow Operational Suite</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fast access to the frontline execution screens built for forklift operators and dispatch billing:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/dock"
                target="_blank"
                className="p-2.5 rounded-lg bg-[#060d17] border border-[#233f63] hover:border-[#d4af37] text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between"
              >
                <span>Dock Tablet</span>
                <ExternalLink className="w-3 h-3 text-[#d4af37]" />
              </Link>
              <Link
                href="/office"
                target="_blank"
                className="p-2.5 rounded-lg bg-[#060d17] border border-[#233f63] hover:border-[#d4af37] text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between"
              >
                <span>Billing Office</span>
                <ExternalLink className="w-3 h-3 text-[#d4af37]" />
              </Link>
              <Link
                href="/reserve"
                target="_blank"
                className="p-2.5 rounded-lg bg-[#060d17] border border-[#233f63] hover:border-[#d4af37] text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between"
              >
                <span>Driver Intake</span>
                <ExternalLink className="w-3 h-3 text-[#d4af37]" />
              </Link>
              <Link
                href="/maps"
                target="_blank"
                className="p-2.5 rounded-lg bg-[#060d17] border border-[#233f63] hover:border-[#d4af37] text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between"
              >
                <span>Maps Acquisition</span>
                <ExternalLink className="w-3 h-3 text-[#d4af37]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
