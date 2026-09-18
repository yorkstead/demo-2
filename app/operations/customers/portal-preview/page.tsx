"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { StatusBadge, ExceptionLifecycleBadge, BillingReadinessBadge } from "@/components/operations/StatusBadge";
import { buildJobDocumentation } from "@/lib/domain/documentation";
import {
  Globe,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building,
  Printer,
  Package,
  Wrench,
  DollarSign,
  HelpCircle,
  Truck,
} from "lucide-react";

export default function CustomerPortalPreviewPage() {
  const { jobs, exceptions, customers, pallets } = useWarehouseStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("CUST-005"); // Default to Rocky Mountain Beverage Co

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const customerJobs = jobs.filter(
    (j) =>
      j.customer.name.toLowerCase().includes(activeCustomer.name.toLowerCase()) ||
      j.customer.id === activeCustomer.id
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Client Self-Service Interface
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Customer Portal Live Preview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            How shippers, carriers, and freight brokers track their loads, authorize change orders, and access certified job packets.
          </p>
        </div>

        {/* Account Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Simulate Account:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="bg-[#0b192c] border border-[#233f63] rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#d4af37]"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulated Portal View Container */}
      <div className="rounded-2xl border-2 border-[#233f63] bg-[#081525] p-6 space-y-8 shadow-2xl">
        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Authenticated Enterprise Shipper Portal</span>
              <div className="text-lg font-black text-white">{activeCustomer.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Direct Carrier Link</span>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[11px]">Primary Terminal</div>
              <div className="font-bold text-[#d4af37]">Denver Express (6030 Washington St)</div>
            </div>
          </div>
        </div>

        {/* Customer Quick Answers Dashboard (Directly Addressing Core Shipper Questions) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>1. Freight In Facility</span>
            </div>
            <div className="text-xl font-black text-white">
              {customerJobs.reduce((sum, j) => sum + j.palletCount, 0)} Pallets
            </div>
            <div className="text-[11px] text-slate-400">
              Across {customerJobs.length} active work order{customerJobs.length > 1 ? "s" : ""}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Current Operation</span>
            </div>
            <div className="text-sm font-bold text-emerald-400 truncate">
              {customerJobs[0]?.status.replace("_", " ").toUpperCase() || "IDLE"}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Bay: {customerJobs[0]?.dockDoor || "Yard Staged"}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Awaiting Customer Action</span>
            </div>
            <div className="text-xl font-black text-amber-300">
              {exceptions.filter((e) => customerJobs.some((j) => j.id === e.jobId) && e.status === "awaiting_customer").length} Item(s)
            </div>
            <div className="text-[11px] text-slate-400">Change order authorization required</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. Documentation</span>
            </div>
            <div className="text-sm font-bold text-white">Certified Job Packets</div>
            <div className="text-[11px] text-emerald-400">Available for instant download</div>
          </div>
        </div>

        {/* Active Work Orders Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Freight Work Orders ({customerJobs.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">Real-time status synced with terminal dispatch</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {customerJobs.map((job) => {
              const jobPallets = pallets.filter((p) => p.jobId === job.id);
              const jobEx = exceptions.filter((e) => e.jobId === job.id);
              const pendingEx = jobEx.find((e) => e.status === "awaiting_customer");
              const resolvedEx = jobEx.find((e) => e.status === "resolved");
              const docCompleteness = buildJobDocumentation(job, jobPallets, jobEx);
              const hasApprovedAddition = (job.approvedAdditions ?? 0) > 0;

              return (
                <div
                  key={job.id}
                  className={`p-6 rounded-xl bg-[#0b192c] border transition space-y-6 ${
                    pendingEx
                      ? "border-amber-500/60 shadow-lg shadow-amber-950/20"
                      : "border-[#1a3353]"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-[#d4af37]">{job.id}</span>
                        {job.id === "DX-260918-037" && (
                          <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                            Priority Rescue
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-white mt-0.5">{job.service}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Trailer: <strong className="text-amber-400">{job.trailer}</strong> • BOL: {job.bolNumber} • Carrier: {job.carrier.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stage</span>
                        <StatusBadge status={job.status} />
                      </div>
                      <Link
                        href={`/operations/jobs/${job.id}/packet`}
                        target="_blank"
                        className="px-3.5 py-2 rounded-lg bg-[#142844] hover:bg-[#1a3353] border border-[#233f63] text-xs font-bold text-slate-200 flex items-center gap-1.5 transition shadow"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>View / Print Job Packet</span>
                      </Link>
                    </div>
                  </div>

                  {/* Pending Action Required Banner */}
                  {pendingEx && (
                    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span>Action Required: Authorization for Corrective Rebuild</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {pendingEx.title}: {pendingEx.recommendedAction} (+${(pendingEx.changeOrderAmount ?? 285).toFixed(2)})
                        </p>
                      </div>
                      <Link
                        href={`/approval/${pendingEx.id}`}
                        target="_blank"
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
                      >
                        <span>Review &amp; Authorize Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {/* Completed Work Banner if Resolved */}
                  {resolvedEx && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Work Completed: Change Order {resolvedEx.id} Restack &amp; Plumb passed QA inspection. Freight staged for reload.
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        Authorized: ${resolvedEx.changeOrderAmount?.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Detailed Pallet Manifest & Staging */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Operational Details */}
                    <div className="p-4 rounded-lg bg-[#060d17] border border-slate-800 space-y-2.5">
                      <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Terminal Staging &amp; Bay Location</span>
                      </div>
                      <div className="space-y-1.5 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Bay:</span>
                          <span className="font-mono font-bold text-emerald-400">{job.dockDoor || "Yard Staging Spot"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Pallet Inventory:</span>
                          <span className="font-semibold">{job.palletCount} Total Units (Beverage Cans)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Driver Check-in:</span>
                          <span>{job.driver.name} ({job.driver.phone})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Audit Status:</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{docCompleteness.completedCount} / {docCompleteness.totalCount} Documents Verified</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Commercial Authorization Summary */}
                    <div className="p-4 rounded-lg bg-[#060d17] border border-slate-800 space-y-2.5">
                      <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Commercial Summary &amp; Billable Total</span>
                      </div>
                      <div className="space-y-1.5 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Base Quoted Rescue Work:</span>
                          <span className="font-mono font-semibold">${job.quoteAmount.toFixed(2)}</span>
                        </div>

                        {hasApprovedAddition && (
                          <div className="flex justify-between text-emerald-400 font-semibold">
                            <span>Authorized Change Order ({jobEx[0]?.id || "EX-1049"}):</span>
                            <span className="font-mono">+${(job.approvedAdditions ?? 0).toFixed(2)}</span>
                          </div>
                        )}

                        {pendingEx && (
                          <div className="flex justify-between text-amber-400">
                            <span>Pending Customer Authorization:</span>
                            <span className="font-mono font-bold">+${(pendingEx.changeOrderAmount ?? 285).toFixed(2)}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-sm">
                          <span className="text-white">Authorized Billable Total:</span>
                          <span className="font-mono text-lg text-emerald-400 font-black">
                            ${job.billableAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
