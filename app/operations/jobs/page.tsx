"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { StatusBadge, PriorityBadge } from "@/components/operations/StatusBadge";
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
} from "lucide-react";

export default function JobsPage() {
  const { jobs, assignDockDoor, updateJobStatus } = useWarehouseStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [selectedJobId, setSelectedJobId] = useState<string | null>("DX-260918-033");

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Operations • Work Order Lifecycle
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Job & Work Order Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track freight rescue, shifted pallet restacking, container transload, and cross-docking jobs.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            <option value="inbound">Inbound Gate</option>
            <option value="dock_assigned">Dock Assigned</option>
            <option value="active_rework">Active Rework</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="staged">Staged</option>
            <option value="storage">Storage</option>
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
        <div className="lg:col-span-7 bg-[#0b192c] border border-[#1a3353] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1a3353] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {filteredJobs.length} Work Orders Found
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Sorted by arrival recency</span>
          </div>

          <div className="divide-y divide-[#1a3353] max-h-[700px] overflow-y-auto">
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected ? "bg-[#162b45] border-l-4 border-l-[#d4af37]" : "hover:bg-[#102237]"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{job.id}</span>
                      <PriorityBadge priority={job.priority} />
                      <span className="text-xs font-bold text-[#d4af37]">{job.service}</span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium">
                      <span>{job.carrier.name}</span>
                      <span className="text-slate-500 mx-1.5">•</span>
                      <span className="font-mono text-slate-400">Trl {job.trailer}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Customer: {job.customer.name}</span>
                      <span>•</span>
                      <span>{job.palletCount} Pallets</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <StatusBadge status={job.status} />
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        ${job.billableAmount.toFixed(2)}
                      </span>
                      <div className="text-[10px] text-slate-500">
                        {job.dockDoor || "Yard Staging"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Job Detail & Operational Actions */}
        {selectedJob && (
          <div className="lg:col-span-5 bg-[#0b192c] border border-[#1a3353] rounded-xl p-5 space-y-5">
            <div className="flex items-start justify-between border-b border-[#1a3353] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-white">{selectedJob.id}</span>
                  <PriorityBadge priority={selectedJob.priority} />
                </div>
                <div className="text-sm font-bold text-[#d4af37] mt-0.5">
                  {selectedJob.service}
                </div>
              </div>

              <StatusBadge status={selectedJob.status} />
            </div>

            {/* Quick Actions Bar */}
            <div className="p-3 rounded-lg bg-[#060d17] border border-[#233f63] space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Operational State Controls
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedJob.status === "inbound" && (
                  <button
                    onClick={() => assignDockDoor(selectedJob.id, "Door 2")}
                    className="p-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                  >
                    Assign Door 2 →
                  </button>
                )}
                {selectedJob.status === "dock_assigned" && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, "active_rework")}
                    className="p-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
                  >
                    Start Rework →
                  </button>
                )}
                {selectedJob.status === "active_rework" && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, "ready_for_billing")}
                    className="p-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Mark Billed Ready →
                  </button>
                )}
                {selectedJob.status === "awaiting_approval" && (
                  <Link
                    href="/operations/customers/approvals"
                    className="p-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center transition"
                  >
                    Review Approval →
                  </Link>
                )}

                <Link
                  href="/dock"
                  target="_blank"
                  className="p-2 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition"
                >
                  <span>Open Dock Tablet</span>
                  <ExternalLink className="w-3 h-3 text-[#d4af37]" />
                </Link>
                <Link
                  href="/office"
                  target="_blank"
                  className="p-2 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition"
                >
                  <span>Dispatch Cert</span>
                  <ExternalLink className="w-3 h-3 text-[#d4af37]" />
                </Link>
              </div>
            </div>

            {/* Carrier & Driver Info */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Freight & Driver Assignment
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#081525] border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px]">Carrier / SCAC</span>
                  <div className="font-semibold text-white">{selectedJob.carrier.name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{selectedJob.carrier.scac || "N/A"}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Trailer / Plate</span>
                  <div className="font-mono font-bold text-[#d4af37]">{selectedJob.trailer}</div>
                  <div className="text-slate-400 text-[11px]">BOL: {selectedJob.bolNumber}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Driver Name</span>
                  <div className="font-medium text-white">{selectedJob.driver.name}</div>
                  <div className="text-slate-400 text-[11px]">{selectedJob.driver.phone}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Location & Bay</span>
                  <div className="font-semibold text-emerald-400">
                    {selectedJob.dockDoor || "Yard Staging"}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {selectedJob.warehouseLocations.join(", ")}
                  </div>
                </div>
              </div>
            </div>

            {/* Financials & Labor */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Billing & Labor Accrual
              </div>
              <div className="p-3 rounded-lg bg-[#081525] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Customer Account:</span>
                  <span className="font-semibold text-white">{selectedJob.customer.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Labor Hours Logged:</span>
                  <span className="font-mono text-slate-200">
                    {selectedJob.labor.hoursLogged} hrs ({selectedJob.labor.assignedTech})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pallet Count:</span>
                  <span className="font-mono text-slate-200">{selectedJob.palletCount} units</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold">
                  <span className="text-white">Billable Total:</span>
                  <span className="font-mono text-base text-emerald-400">
                    ${selectedJob.billableAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Evidence */}
            {selectedJob.notes && (
              <div className="space-y-1.5 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Notes
                </div>
                <div className="p-3 rounded-lg bg-[#081525] border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
                  {selectedJob.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
