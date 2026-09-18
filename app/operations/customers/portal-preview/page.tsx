"use client";

import { useWarehouseStore } from "@/lib/domain/store";
import { Globe, ShieldCheck, ExternalLink, ArrowRight, Clock, FileText } from "lucide-react";
import { StatusBadge } from "@/components/operations/StatusBadge";

export default function CustomerPortalPreviewPage() {
  const { jobs } = useWarehouseStore();
  const sampleCustomer = "Swift Transportation Logistics";
  const customerJobs = jobs.filter((j) => j.customer.name === sampleCustomer);

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
            How carriers and freight brokers track their loads in real time at Denver Express.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Authenticated Session: Swift Transportation</span>
        </div>
      </div>

      {/* Simulated Portal View */}
      <div className="rounded-2xl border-2 border-[#233f63] bg-[#081525] p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Broker Portal</span>
            <div className="text-lg font-black text-white">{sampleCustomer}</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Terminal Location</span>
            <div className="text-xs font-bold text-[#d4af37]">Denver Express (6030 Washington St)</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Freight Orders ({customerJobs.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#d4af37]">{job.id}</span>
                  <StatusBadge status={job.status} />
                </div>

                <div>
                  <div className="text-sm font-bold text-white">{job.service}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Trailer: {job.trailer} • BOL: {job.bolNumber}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#060d17] border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dock Bay:</span>
                    <span className="font-semibold text-emerald-400">{job.dockDoor || "Yard Staged"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver:</span>
                    <span>{job.driver.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pallet Count:</span>
                    <span>{job.palletCount} units</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-emerald-400">
                    Quote: ${job.billableAmount.toFixed(2)}
                  </span>
                  <span className="text-slate-400">Photos & Certificate Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
