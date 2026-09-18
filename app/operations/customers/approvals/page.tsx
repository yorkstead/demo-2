"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { ExceptionLifecycleBadge, SeverityBadge } from "@/components/operations/StatusBadge";
import { ExceptionLifecycleStatus } from "@/lib/domain/types";
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  ExternalLink,
  Eye,
  Clock,
  ArrowRight,
  Filter,
  DollarSign,
  PlayCircle,
  CheckCheck,
} from "lucide-react";

export default function ApprovalsPage() {
  const {
    exceptions,
    jobs,
    pallets,
    updateExceptionApproval,
    approveChangeOrder,
    holdFreight,
    beginCorrectiveWork,
    completeCorrectiveWork,
  } = useWarehouseStore();

  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredExceptions = exceptions.filter((ex) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "awaiting") return ex.status === "awaiting_customer";
    if (activeFilter === "approved") return ex.status === "approved";
    if (activeFilter === "in_progress") return ex.status === "in_progress";
    if (activeFilter === "resolved") return ex.status === "resolved";
    if (activeFilter === "declined") return ex.status === "declined";
    return true;
  });

  const awaitingCount = exceptions.filter((e) => e.status === "awaiting_customer").length;
  const approvedCount = exceptions.filter((e) => e.status === "approved").length;
  const inProgressCount = exceptions.filter((e) => e.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Commercial & Operations Sync
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Customer Rework Authorizations & Change Orders
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time queue tracking out-of-scope defects, customer review activity, and work order authorization states.
          </p>
        </div>

        {/* Quick link to Flagship customer view */}
        <Link
          href="/approval/EX-1049"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition"
        >
          <span>Open Customer Approval View (EX-1049)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Tabs & KPI Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1a3353] pb-3">
        {[
          { id: "all", label: `All Exceptions (${exceptions.length})` },
          { id: "awaiting", label: `Awaiting Customer (${awaitingCount})`, highlight: awaitingCount > 0 },
          { id: "approved", label: `Authorized (${approvedCount})` },
          { id: "in_progress", label: `In Progress (${inProgressCount})` },
          { id: "resolved", label: "Resolved" },
          { id: "declined", label: "Held / Declined" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === tab.id
                ? "bg-[#d4af37] text-[#060d17] shadow-md"
                : "bg-[#0b192c] text-slate-300 hover:bg-[#142844] border border-[#1a3353]"
            }`}
          >
            {tab.highlight && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Exceptions List */}
      <div className="space-y-4">
        {filteredExceptions.map((ex) => {
          const relatedJob = jobs.find((j) => j.id === ex.jobId);
          const changeCost = ex.changeOrderAmount ?? ex.additionalCost ?? 0;
          const isAwaiting = ex.status === "awaiting_customer";
          const isApproved = ex.status === "approved";
          const isInProgress = ex.status === "in_progress";
          const isResolved = ex.status === "resolved";

          return (
            <div
              key={ex.id}
              className={`p-5 rounded-xl bg-[#0b192c] border transition space-y-4 ${
                isAwaiting
                  ? "border-amber-500/50 shadow-lg shadow-amber-950/20"
                  : isApproved
                  ? "border-emerald-500/40"
                  : "border-[#1a3353]"
              }`}
            >
              {/* Card Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a3353] pb-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-mono text-sm font-black text-white">{ex.id}</span>
                  <SeverityBadge severity={ex.severity} />
                  <ExceptionLifecycleBadge status={ex.status} />

                  <span className="text-xs text-slate-400">
                    Work Order:{" "}
                    <Link
                      href={`/operations/jobs?job=${ex.jobId}`}
                      className="font-mono font-bold text-amber-400 hover:underline"
                    >
                      {ex.jobId}
                    </Link>
                  </span>
                  <span className="text-xs text-slate-400 hidden md:inline">•</span>
                  <span className="text-xs text-slate-300 font-medium hidden md:inline">
                    {relatedJob?.customer.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {ex.customerViewedTime && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      <Eye className="w-3 h-3" />
                      <span>Viewed by Customer</span>
                    </span>
                  )}
                  <Link
                    href={`/approval/${ex.id}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-[#d4af37] hover:text-amber-300 font-bold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 transition"
                  >
                    <span>Customer Portal View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Card Body Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left 2 Cols: Details, Pallet, SOP, Photos */}
                <div className="lg:col-span-2 space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{ex.title}</span>
                      {ex.palletId && (
                        <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {ex.palletId}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {ex.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#060d17] border border-[#142844] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Prescribed SOP Remedy:</span>
                      <span className="font-mono text-amber-300 font-semibold">{ex.location || "Bay RW-01"}</span>
                    </div>
                    <div className="text-slate-200 font-medium">
                      {ex.recommendedAction || ex.resolutionNotes}
                    </div>
                  </div>

                  {/* Photo thumbnails */}
                  {ex.photos && ex.photos.length > 0 && (
                    <div className="flex items-center gap-2.5 pt-1">
                      {ex.photos.map((src, i) => (
                        <div
                          key={i}
                          className="w-24 h-16 rounded-lg bg-black overflow-hidden border border-slate-700 hover:border-amber-400 transition"
                        >
                          <img src={src} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="text-[11px] text-slate-500">
                        {ex.photos.length} damage evidence photo{ex.photos.length > 1 ? "s" : ""} attached
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Col: Commercial State & Actions */}
                <div className="p-4 rounded-xl bg-[#060d17] border border-[#233f63] flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Change Order Commercial Authorization
                    </span>
                    <div className="mt-1.5 text-2xl font-mono font-black text-amber-400">
                      ${changeCost.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                      <div>Base Contract: <strong className="text-slate-200">${(relatedJob?.quoteAmount || 450).toFixed(2)}</strong></div>
                      <div>Authorized Billable: <strong className="text-emerald-400">${(relatedJob?.billableAmount || 450).toFixed(2)}</strong></div>
                    </div>
                  </div>

                  {/* Interactive Status-specific Actions */}
                  <div className="space-y-2 pt-2 border-t border-[#142844]">
                    {isAwaiting ? (
                      <>
                        <button
                          onClick={() => approveChangeOrder(ex.id, "Tom Bradley (One-Click)", "tbradley@rockymountainbev.com")}
                          className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Simulate Customer Approval (${changeCost.toFixed(2)})</span>
                        </button>
                        <button
                          onClick={() => holdFreight(ex.id, "Declined by customer - staged in quarantine buffer")}
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline / Place on Hold</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <div className="space-y-2">
                        <div className="p-2 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium">
                          Authorized by {ex.approvedBy || "Customer"}
                        </div>
                        <button
                          onClick={() => beginCorrectiveWork(ex.id, "Dave M. (FL-02)")}
                          className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Begin Corrective Work in Bay RW-01</span>
                        </button>
                      </div>
                    ) : isInProgress ? (
                      <div className="space-y-2">
                        <div className="p-2 rounded bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs text-center font-medium">
                          Rework In Progress (Bay RW-01)
                        </div>
                        <button
                          onClick={() => completeCorrectiveWork(ex.id, "Dave M. (FL-02)", "ST-03")}
                          className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Complete Rebuild & Move to ST-03</span>
                        </button>
                      </div>
                    ) : isResolved ? (
                      <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center font-semibold">
                        ✓ Corrective Rework Completed & Pallet Staged
                      </div>
                    ) : (
                      <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center font-semibold">
                        Freight On Quarantine Hold
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
