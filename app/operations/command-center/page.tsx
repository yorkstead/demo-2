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
} from "lucide-react";

export default function CommandCenterPage() {
  const { jobs, trailers, locations, exceptions } = useWarehouseStore();

  const dockDoors = locations.filter((l) => l.zone === "dock_door");
  const occupiedDoors = dockDoors.filter((d) => d.status === "full" || d.status === "partial").length;
  const activeJobs = jobs.filter((j) => j.status !== "completed");
  const unbilledRevenue = jobs
    .filter((j) => j.billingStatus === "unbilled" || j.billingStatus === "pending_review")
    .reduce((acc, j) => acc + j.billableAmount, 0);

  const pendingExceptions = exceptions.filter((e) => e.approvalStatus === "pending");

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
            Real-time yard queue, active dock assignments, and freight rework triage at I-25 & I-70.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
          <div className="mt-2 text-[11px] text-slate-400">
            {jobs.filter((j) => j.status === "active_rework").length} active in rework bays
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
            <span className="text-xs text-slate-400 font-semibold">doors active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Doors 2 & 5 active turnarounds
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
          <div className="mt-2 text-[11px] text-slate-400">
            1 critical leaning load (I-70 shift)
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
            3 orders ready for QuickBooks export
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
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
              Live bay assignments and forklift terminal statuses.
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
            const assignedJob = jobs.find((j) => j.dockDoor && door.name.includes(j.dockDoor));
            const isFull = door.status === "full";
            const isPartial = door.status === "partial";

            return (
              <div
                key={door.id}
                className={`p-3.5 rounded-lg border flex flex-col justify-between transition ${
                  isFull
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
                    </div>
                  ) : (
                    <div className="mt-4 text-[11px] text-slate-500 font-medium">
                      Door Available
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">
                    {assignedJob ? `${assignedJob.palletCount} Plts` : "Ready"}
                  </span>
                  {assignedJob && (
                    <Link
                      href="/dock"
                      target="_blank"
                      className="text-[#d4af37] font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Tablet</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
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
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#162b45] border border-[#233f63] flex items-center justify-center font-mono text-xs font-bold text-[#d4af37] shrink-0">
                    {job.dockDoor ? job.dockDoor.replace("Door ", "D") : "YD"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{job.id}</span>
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
                    className="p-1 rounded hover:bg-[#162b45] text-slate-400 hover:text-white transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
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
                        href="/operations/customers/approvals"
                        className="text-rose-400 font-bold hover:underline"
                      >
                        Approval Pending →
                      </Link>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Resolved</span>
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
