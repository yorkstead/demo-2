"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { StatusBadge, PriorityBadge, SeverityBadge, ApprovalBadge, ExceptionLifecycleBadge } from "@/components/operations/StatusBadge";
import { JobStatus, ServiceType } from "@/lib/domain/types";
import {
  Truck,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  User,
  CheckCircle,
  X,
  AlertTriangle,
  Layers,
  Wrench,
  Boxes,
  MoveRight,
  Check,
  Camera,
  PlayCircle,
  CheckCheck,
} from "lucide-react";

function JobsPageContent() {
  const {
    jobs,
    pallets,
    exceptions,
    locations,
    assignDockDoor,
    updateJobStatus,
    updatePalletLocation,
    updateExceptionApproval,
    approveChangeOrder,
    holdFreight,
    beginCorrectiveWork,
    completeCorrectiveWork,
  } = useWarehouseStore();
  const searchParams = useSearchParams();
  const queryJobId = searchParams.get("job");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [selectedJobId, setSelectedJobId] = useState<string>("DX-260918-037");

  // Relocate Pallet Modal State
  const [relocatePalletId, setRelocatePalletId] = useState<string | null>(null);
  const [targetLocation, setTargetLocation] = useState<string>("ST-03");

  useEffect(() => {
    if (queryJobId && jobs.some((j) => j.id === queryJobId)) {
      setSelectedJobId(queryJobId);
    }
  }, [queryJobId, jobs]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(search.toLowerCase()) ||
      job.trailer.toLowerCase().includes(search.toLowerCase()) ||
      job.carrier.name.toLowerCase().includes(search.toLowerCase()) ||
      job.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      job.bolNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesService = serviceFilter === "all" || job.service === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const jobPallets = pallets.filter((p) => p.jobId === selectedJob?.id);
  const jobExceptions = exceptions.filter((e) => e.jobId === selectedJob?.id);

  // Available dock doors for reassignment
  const dockDoors = locations.filter((l) => l.id.startsWith("D-"));

  // Lifecycle stages definition
  const lifecycleStages: { key: JobStatus; label: string; desc: string }[] = [
    { key: "requested", label: "Intake", desc: "Work order created" },
    { key: "arrived", label: "Arrived", desc: "Checked in at gate" },
    { key: "dock_assigned", label: "Docked", desc: "Backed into bay" },
    { key: "in_progress", label: "Reworking", desc: "Labor in progress" },
    { key: "awaiting_approval", label: "Hold / Signoff", desc: "Customer quote review" },
    { key: "staged", label: "Staged", desc: "Ready for reload" },
    { key: "ready_for_billing", label: "Billing", desc: "Documentation verified" },
    { key: "completed", label: "Completed", desc: "Invoiced & departed" },
  ];

  const currentStageIndex = lifecycleStages.findIndex((s) => s.key === selectedJob?.status);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Operations • Work Order Lifecycle
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Job &amp; Work Order Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track freight rescue, shifted pallet restacking, container transload, and cross-docking jobs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedJobId("DX-260918-037")}
            className="px-3.5 py-2 rounded-lg bg-[#162b45] hover:bg-[#1f3b5f] border border-[#233f63] text-xs font-bold text-[#d4af37] transition flex items-center gap-1.5"
          >
            <span>★ Jump to Flagship (DX-260918-037)</span>
          </button>
          <Link
            href="/reserve"
            target="_blank"
            className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <span>+ Driver Intake Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Job ID, Trailer #, Carrier, Customer, or BOL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#060d17] border border-[#233f63] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#060d17] border border-[#233f63] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">All Statuses</option>
            <option value="requested">Requested</option>
            <option value="scheduled">Scheduled</option>
            <option value="arrived">Arrived</option>
            <option value="waiting">Yard Waiting</option>
            <option value="dock_assigned">Dock Assigned</option>
            <option value="in_progress">In Progress / Rework</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="staged">Staged Outbound</option>
            <option value="ready_for_billing">Ready for Billing</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-[#060d17] border border-[#233f63] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">All Services</option>
            <option value="Shifted Pallets">Shifted Pallets</option>
            <option value="Freight Rescue">Freight Rescue</option>
            <option value="Axle Rebalance">Axle Rebalance</option>
            <option value="Pallet Swap">Pallet Swap</option>
            <option value="Floor Transload">Floor Transload</option>
            <option value="Cross-Dock">Cross-Dock</option>
            <option value="Short-Term Storage">Short-Term Storage</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Work Orders Table + Detail Slide-over Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Grid */}
        <div className="lg:col-span-5 bg-[#0b192c] border border-[#1a3353] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#1a3353] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {filteredJobs.length} Work Orders Found
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Sorted by arrival recency</span>
          </div>

          <div className="divide-y divide-[#1a3353] max-h-[850px] overflow-y-auto">
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isFlagship = job.id === "DX-260918-037";
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 cursor-pointer transition flex flex-col gap-2 ${
                    isSelected
                      ? "bg-[#162b45] border-l-4 border-l-[#d4af37]"
                      : "hover:bg-[#102237]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{job.id}</span>
                      {isFlagship && (
                        <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-[#d4af37] border border-amber-500/40 px-1.5 py-0.5 rounded">
                          ★ Flagship
                        </span>
                      )}
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      ${job.billableAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#d4af37]">{job.service}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {job.dockDoor || "Yard Spot"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="font-medium text-white">{job.customer.name}</span>
                    <span className="text-slate-500 mx-1.5">•</span>
                    <span className="text-slate-400 font-mono">Trl {job.trailer}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>{job.palletCount} Pallets</span>
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Job Detail & Operational Actions */}
        {selectedJob && (
          <div className="lg:col-span-7 bg-[#0b192c] border border-[#1a3353] rounded-xl p-6 space-y-6">
            {/* Header / Identity */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1a3353] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-black text-white">{selectedJob.id}</span>
                  {selectedJob.id === "DX-260918-037" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-[#d4af37] border border-amber-500/40">
                      ★ Flagship Operational Scenario
                    </span>
                  )}
                  <PriorityBadge priority={selectedJob.priority} />
                </div>
                <div className="text-base font-bold text-[#d4af37] mt-1">
                  {selectedJob.service}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Customer: <strong className="text-white">{selectedJob.customer.name}</strong> • Carrier: <strong className="text-white">{selectedJob.carrier.name}</strong>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <StatusBadge status={selectedJob.status} />
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Total Accrued:</span>
                  <div className="font-mono text-xl font-black text-emerald-400">
                    ${selectedJob.billableAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Visual Lifecycle Progression */}
            <div className="p-4 rounded-lg bg-[#060d17] border border-[#233f63] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">
                  Operational Lifecycle Progression
                </span>
                <span className="text-[#d4af37] font-semibold">
                  Stage {currentStageIndex >= 0 ? currentStageIndex + 1 : 1} of {lifecycleStages.length}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                {lifecycleStages.map((st, idx) => {
                  const isDone = currentStageIndex > idx;
                  const isCurrent = selectedJob.status === st.key;
                  return (
                    <div
                      key={st.key}
                      className={`p-2 rounded flex flex-col items-center text-center transition ${
                        isCurrent
                          ? "bg-amber-500/20 border border-amber-500/40"
                          : isDone
                          ? "bg-emerald-950/40 border border-emerald-500/30"
                          : "bg-slate-900/50 border border-slate-800 text-slate-600"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                          isCurrent
                            ? "bg-amber-400 text-slate-950 animate-pulse"
                            : isDone
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold uppercase truncate w-full ${isCurrent ? "text-amber-300" : isDone ? "text-emerald-300" : "text-slate-500"}`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Lifecycle Stage Advancement Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {selectedJob.status === "requested" && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, "arrived")}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                  >
                    Confirm Yard Arrival →
                  </button>
                )}
                {selectedJob.status === "waiting" && (
                  <button
                    onClick={() => assignDockDoor(selectedJob.id, "Door 3")}
                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                  >
                    Assign to Door 3 →
                  </button>
                )}
                {selectedJob.status === "dock_assigned" && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, "in_progress")}
                    className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
                  >
                    Begin Forklift Unloading / Rework →
                  </button>
                )}
                {selectedJob.status === "in_progress" && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, "staged")}
                    className="px-3 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition"
                  >
                    Mark Rework Complete &amp; Staged →
                  </button>
                )}
                {selectedJob.status === "staged" && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, "ready_for_billing")}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Approve for Dispatch Billing →
                  </button>
                )}
                {selectedJob.status === "ready_for_billing" && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, "completed")}
                    className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                  >
                    Finalize &amp; Close Work Order →
                  </button>
                )}

                <Link
                  href="/dock"
                  target="_blank"
                  className="px-3 py-1.5 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-slate-200 font-bold text-xs flex items-center gap-1 transition ml-auto"
                >
                  <span>Open Active5 Dock Tablet</span>
                  <ExternalLink className="w-3 h-3 text-[#d4af37]" />
                </Link>
                <Link
                  href="/office"
                  target="_blank"
                  className="px-3 py-1.5 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-slate-200 font-bold text-xs flex items-center gap-1 transition"
                >
                  <span>Dispatch Cert</span>
                  <ExternalLink className="w-3 h-3 text-[#d4af37]" />
                </Link>
              </div>
            </div>

            {/* Exception & Customer Approval Alert if Present */}
            {jobExceptions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Defect &amp; Customer Authorization Triage</span>
                  </div>
                  <Link
                    href="/operations/customers/approvals"
                    className="text-xs text-[#d4af37] hover:underline font-semibold"
                  >
                    Approvals Queue →
                  </Link>
                </div>

                {jobExceptions.map((ex) => {
                  const changeAmount = ex.changeOrderAmount ?? ex.additionalCost ?? 0;
                  const isAwaiting = ex.status === "awaiting_customer";
                  const isApproved = ex.status === "approved";
                  const isInProgress = ex.status === "in_progress";
                  const isResolved = ex.status === "resolved";
                  const isHeld = ex.status === "declined" || ex.resolutionState === "held";

                  return (
                    <div
                      key={ex.id}
                      className={`p-4 rounded-lg space-y-3 transition border ${
                        isAwaiting
                          ? "bg-rose-950/20 border-rose-500/40"
                          : isApproved
                          ? "bg-emerald-950/20 border-emerald-500/40"
                          : isInProgress
                          ? "bg-amber-950/20 border-amber-500/40"
                          : "bg-[#081525] border-slate-800"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{ex.id}</span>
                          <SeverityBadge severity={ex.severity} />
                          <ExceptionLifecycleBadge status={ex.status} />
                          {ex.palletId && (
                            <span className="font-mono text-xs text-amber-300 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                              {ex.palletId}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/approval/${ex.id}`}
                          target="_blank"
                          className="text-xs text-[#d4af37] hover:text-amber-300 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30"
                        >
                          <span>Customer Portal View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white">{ex.title}</div>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1">
                          {ex.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                        <div className="text-slate-300">
                          Prescribed SOP: <span className="text-[#d4af37] font-semibold">{ex.recommendedAction || ex.resolutionNotes}</span>
                        </div>
                        <div className="font-mono font-bold text-amber-400 shrink-0">
                          Change Order: +${changeAmount.toFixed(2)}
                        </div>
                      </div>

                      {/* Interactive Operator Lifecycle Controls */}
                      <div className="pt-2 border-t border-slate-800">
                        {isAwaiting ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => approveChangeOrder(ex.id, "Tom Bradley (Broker Authorized)", "tbradley@rockymountainbev.com")}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Authorize Change Order (+$285.00)</span>
                            </button>
                            <button
                              onClick={() => holdFreight(ex.id, "Shipper requests quarantine hold")}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs transition cursor-pointer"
                            >
                              Decline / Place on Hold
                            </button>
                          </div>
                        ) : isApproved ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-950/40 p-2.5 rounded border border-emerald-500/30">
                            <div className="text-xs text-emerald-300">
                              ✓ Authorized by <strong className="text-white">{ex.approvedBy || "Customer"}</strong>. Ready for corrective labor.
                            </div>
                            <button
                              onClick={() => beginCorrectiveWork(ex.id, "Dave M. (FL-02)")}
                              className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow shrink-0 cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Begin Corrective Work (Bay RW-01) →</span>
                            </button>
                          </div>
                        ) : isInProgress ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950/40 p-2.5 rounded border border-amber-500/30">
                            <div className="text-xs text-amber-300">
                              ⚙ Rebuild active in <strong className="text-white">Bay RW-01</strong> by Dave M.
                            </div>
                            <button
                              onClick={() => completeCorrectiveWork(ex.id, "Dave M. (FL-02)", "ST-03")}
                              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow shrink-0 cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Complete Rebuild &amp; Plumb Check → Stage in ST-03</span>
                            </button>
                          </div>
                        ) : isResolved ? (
                          <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Corrective rebuild complete. Pallet P08 restacked, banded, and staged in Bay ST-03.</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                            Freight on Quarantine Hold in Bay RW-01 buffer.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Freight Units / Pallet Condition Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-[#d4af37]" />
                  <span>Serialized Freight Units ({jobPallets.length} Pallets)</span>
                </div>
                <Link
                  href="/operations/freight/inventory"
                  className="text-xs text-[#d4af37] hover:underline font-semibold"
                >
                  Full Inventory View →
                </Link>
              </div>

              <div className="rounded-lg bg-[#081525] border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#060d17] text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Pallet ID</th>
                        <th className="p-2.5">Current Location</th>
                        <th className="p-2.5">Weight / Dims</th>
                        <th className="p-2.5">Condition</th>
                        <th className="p-2.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {jobPallets.map((p) => (
                        <tr key={p.id} className="hover:bg-[#0f2136]">
                          <td className="p-2.5 font-mono font-bold text-white">{p.id}</td>
                          <td className="p-2.5">
                            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                              {p.currentLocation}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-400">
                            {p.weightLbs.toLocaleString()} lbs • {p.dimensions.lengthIn}&quot;×{p.dimensions.widthIn}&quot;×{p.dimensions.heightIn}&quot;
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.condition === "leaning"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                  : p.condition === "restacked"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-slate-800 text-slate-300 border border-slate-700"
                              }`}
                            >
                              {p.condition.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <button
                              onClick={() => {
                                setRelocatePalletId(p.id);
                                setTargetLocation(p.currentLocation === "RW-01" ? "ST-03" : "RW-01");
                              }}
                              className="px-2 py-1 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-[10px] font-bold text-slate-200 transition"
                            >
                              Relocate →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Carrier, Driver & Assigned Bay Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#081525] border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Carrier &amp; Driver Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px]">Carrier Name:</span>
                    <div className="font-semibold text-white">{selectedJob.carrier.name}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Trailer / Plate:</span>
                    <div className="font-mono font-bold text-[#d4af37]">{selectedJob.trailer}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Driver:</span>
                    <div className="font-medium text-white">{selectedJob.driver.name}</div>
                    <div className="text-slate-500 text-[10px]">{selectedJob.driver.phone}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">BOL Number:</span>
                    <div className="font-mono text-slate-300">{selectedJob.bolNumber}</div>
                  </div>
                </div>
              </div>

              {/* Labor, Equipment & Materials */}
              <div className="p-4 rounded-lg bg-[#081525] border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Labor &amp; Warehouse Equipment</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px]">Assigned Tech:</span>
                    <div className="font-semibold text-white">{selectedJob.labor.assignedTech}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Labor Hours:</span>
                    <div className="font-mono text-emerald-400 font-bold">{selectedJob.labor.hoursLogged} hrs logged</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px]">Materials Consumed:</span>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {selectedJob.materials?.palletsUsed || 2} Grade-A Hardwood Pallets,{" "}
                      {selectedJob.materials?.wrapRollsUsed || 2} Heavy-Duty Stretch Rolls,{" "}
                      {selectedJob.materials?.cornerBoardsUsed || 8} Corner Boards
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial Breakdown */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#0c1c30] to-[#081525] border border-[#233f63] space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Commercial &amp; Billing Reconciliation</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Billing State:</span>
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {selectedJob.billingStatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Authorized Service ({selectedJob.service}):</span>
                  <span className="font-mono text-slate-200 font-semibold">${selectedJob.quoteAmount.toFixed(2)}</span>
                </div>

                {/* Pending Change Order Row */}
                {(selectedJob.pendingAdditions ?? 0) > 0 && (
                  <div className="flex items-center justify-between p-2 rounded bg-amber-950/30 border border-amber-500/30">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-medium">Pending Change Order (EX-1049):</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        Awaiting Customer Authorization
                      </span>
                    </div>
                    <span className="font-mono font-bold text-amber-300">+${(selectedJob.pendingAdditions ?? 0).toFixed(2)}</span>
                  </div>
                )}

                {/* Approved Change Order Row */}
                {(selectedJob.approvedAdditions ?? 0) > 0 && (
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-950/30 border border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-300 font-medium">Approved Addition (EX-1049 Rebuild):</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Authorized by Customer
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300">+${(selectedJob.approvedAdditions ?? 0).toFixed(2)}</span>
                  </div>
                )}

                {/* Totals Summary */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-white">Authorized Billable Total:</span>
                    <span className="font-mono text-xl text-emerald-400 font-black">
                      ${selectedJob.billableAmount.toFixed(2)}
                    </span>
                  </div>

                  {(selectedJob.pendingAdditions ?? 0) > 0 && (
                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                      <span>Projected Total if Change Order Approved:</span>
                      <span className="font-mono text-amber-300 font-bold">
                        ${(selectedJob.projectedAmount ?? (selectedJob.billableAmount + (selectedJob.pendingAdditions ?? 0))).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Relocate Pallet Modal */}
      {relocatePalletId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#233f63] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MoveRight className="w-4 h-4 text-[#d4af37]" />
                <span>Relocate Pallet: {relocatePalletId}</span>
              </h3>
              <button
                onClick={() => setRelocatePalletId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Destination Zone / Slot:</label>
                <select
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-[#060d17] border border-[#233f63] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <optgroup label="Dedicated Rework Bays">
                    <option value="RW-01">RW-01 (Turntable Stretch Wrapper Bay 1)</option>
                    <option value="RW-02">RW-02 (Heavy Pallet Rebuild Bay 2)</option>
                  </optgroup>
                  <optgroup label="Floor Staging Slots">
                    <option value="ST-01">ST-01 (Inbound Breakout Staging)</option>
                    <option value="ST-02">ST-02 (Inspection Staging)</option>
                    <option value="ST-03">ST-03 (Outbound Staged / Ready for Reload)</option>
                    <option value="ST-04">ST-04 (Cross-Dock Fast Corridor)</option>
                  </optgroup>
                  <optgroup label="Dock Bay Transfer">
                    <option value="D-03">D-03 (Door 3 Loading Apron)</option>
                    <option value="D-02">D-02 (Door 2 Loading Apron)</option>
                  </optgroup>
                  <optgroup label="High-Bay Storage Racks">
                    <option value="A-01">A-01 (Climate Food-Grade High-Bay Tier 1)</option>
                    <option value="B-01">B-01 (Ambient Storage High-Bay Tier 1)</option>
                  </optgroup>
                  <optgroup label="Hold / Quarantine">
                    <option value="HOLD-01">HOLD-01 (Quarantine Inspection Hold)</option>
                  </optgroup>
                </select>
              </div>

              <div className="p-3 rounded bg-[#060d17] border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>Logged Forklift Operator: <strong className="text-slate-200">Marco S. (FL-01)</strong></div>
                <div>Reason: <strong className="text-slate-200">Physical restack / staging stage progression</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a3353]">
              <button
                onClick={() => setRelocatePalletId(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updatePalletLocation(relocatePalletId, targetLocation, "Marco S. (FL-01)", "Stage progression transfer");
                  setRelocatePalletId(null);
                }}
                className="px-4 py-1.5 rounded bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
              >
                Confirm Relocation →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white font-mono text-sm">Loading Work Orders...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}
