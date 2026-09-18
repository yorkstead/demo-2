"use client";

import { useWarehouseStore } from "@/lib/domain/store";
import { SeverityBadge, ApprovalBadge } from "@/components/operations/StatusBadge";
import { CheckSquare, AlertTriangle, CheckCircle, XCircle, Camera } from "lucide-react";

export default function ApprovalsPage() {
  const { exceptions, updateExceptionApproval, jobs } = useWarehouseStore();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
          Customer Authorizations
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Rework & Change-Order Approvals
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Brokers and shippers review damage photos and authorize rework quotes before warehouse labor begins.
        </p>
      </div>

      <div className="space-y-4">
        {exceptions.map((ex) => {
          const relatedJob = jobs.find((j) => j.id === ex.jobId);
          return (
            <div
              key={ex.id}
              className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a3353] pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-white">{ex.id}</span>
                  <SeverityBadge severity={ex.severity} />
                  <span className="text-xs text-slate-400">
                    Account: <strong className="text-slate-200">{relatedJob?.customer.name}</strong>
                  </span>
                </div>
                <ApprovalBadge status={ex.approvalStatus} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-2">
                  <h2 className="text-base font-bold text-white">{ex.title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {ex.description}
                  </p>
                  <div className="text-xs text-slate-400">
                    Proposed Remedy: <span className="text-[#d4af37] font-medium">{ex.resolutionNotes}</span>
                  </div>

                  {ex.photos.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      {ex.photos.map((src, i) => (
                        <div key={i} className="w-24 h-16 rounded bg-black overflow-hidden border border-slate-700">
                          <img src={src} alt="Defect" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-[#060d17] border border-[#233f63] flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Rework Quote Authorization
                    </span>
                    <div className="mt-2 text-2xl font-mono font-black text-emerald-400">
                      ${(ex.additionalCost || 250).toFixed(2)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Includes certified restack labor, heavy-duty wrap, and exchange pallets.
                    </p>
                  </div>

                  {ex.approvalStatus === "pending" ? (
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => updateExceptionApproval(ex.id, "approved", "Customer Dispatch (One-Click)")}
                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Authorize Quote (${(ex.additionalCost || 250).toFixed(2)})</span>
                      </button>
                      <button
                        onClick={() => updateExceptionApproval(ex.id, "rejected", "Customer Dispatch")}
                        className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline (Hold on Dock)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center">
                      Authorized by {ex.approvedBy || "Client"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
