"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { Globe, ShieldCheck, ExternalLink, ArrowRight, Clock, FileText, CheckCircle2, AlertTriangle, Building } from "lucide-react";
import { StatusBadge, ExceptionLifecycleBadge } from "@/components/operations/StatusBadge";

export default function CustomerPortalPreviewPage() {
  const { jobs, exceptions, customers } = useWarehouseStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("CUST-005"); // Default to Rocky Mountain Beverage Co

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const customerJobs = jobs.filter((j) => j.customer.name.toLowerCase().includes(activeCustomer.name.toLowerCase()) || j.customer.id === activeCustomer.id);

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
            How shippers, carriers, and freight brokers track their loads and authorize change orders at Denver Express.
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
      <div className="rounded-2xl border-2 border-[#233f63] bg-[#081525] p-6 space-y-6 shadow-2xl">
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

        {/* Work Orders Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Freight Orders ({customerJobs.length})
            </h2>
            <span className="text-xs text-slate-500">Auto-refresh active (30s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerJobs.map((job) => {
              const jobEx = exceptions.filter((e) => e.jobId === job.id);
              const pendingEx = jobEx.find((e) => e.status === "awaiting_customer");
              const hasApprovedAddition = (job.approvedAdditions ?? 0) > 0;

              return (
                <div
                  key={job.id}
                  className={`p-5 rounded-xl bg-[#0b192c] border transition space-y-4 ${
                    pendingEx
                      ? "border-amber-500/50 shadow-lg shadow-amber-950/20"
                      : "border-[#1a3353]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#d4af37]">{job.id}</span>
                      {job.id === "DX-260918-037" && (
                        <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                          Priority Rescue
                        </span>
                      )}
                    </div>
                    <StatusBadge status={job.status} />
                  </div>

                  <div>
                    <div className="text-base font-bold text-white">{job.service}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Trailer: <strong className="text-amber-400">{job.trailer}</strong> • BOL: {job.bolNumber}
                    </div>
                  </div>

                  {/* Pending Authorization Alert Pill */}
                  {pendingEx && (
                    <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Change Order Authorization Required</span>
                        </div>
                        <div className="text-slate-300 text-[11px] mt-0.5">
                          {pendingEx.title} (+${(pendingEx.changeOrderAmount ?? 285).toFixed(2)})
                        </div>
                      </div>
                      <Link
                        href={`/approval/${pendingEx.id}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1 shrink-0 shadow"
                      >
                        <span>Review & Authorize</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-[#060d17] border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dock Bay:</span>
                      <span className="font-semibold text-emerald-400">{job.dockDoor || "Yard Staged"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Driver Contact:</span>
                      <span>{job.driver.name} ({job.driver.phone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pallet Count:</span>
                      <span>{job.palletCount} units</span>
                    </div>
                  </div>

                  {/* Commercial summary */}
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Authorized Contract:</span>
                      <span className="font-mono text-slate-200">${job.quoteAmount.toFixed(2)}</span>
                    </div>
                    {hasApprovedAddition && (
                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>Approved Addition (EX-1049):</span>
                        <span className="font-mono">+${(job.approvedAdditions ?? 0).toFixed(2)}</span>
                      </div>
                    )}
                    {pendingEx && (
                      <div className="flex justify-between text-amber-400">
                        <span>Pending Change Order:</span>
                        <span className="font-mono font-bold">+${(pendingEx.changeOrderAmount ?? 285).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 font-bold text-sm">
                      <span className="text-white">Authorized Total:</span>
                      <span className="font-mono text-emerald-400 font-black">
                        ${job.billableAmount.toFixed(2)}
                      </span>
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
