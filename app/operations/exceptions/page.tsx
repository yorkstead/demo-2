"use client";

import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { SeverityBadge, ApprovalBadge } from "@/components/operations/StatusBadge";
import { AlertTriangle, Camera, CheckCircle2, ArrowRight } from "lucide-react";

export default function ExceptionsPage() {
  const { exceptions, updateExceptionApproval } = useWarehouseStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Quality & Claims Prevention
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Exception & Damage Triage
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Log, photograph, and manage approvals for shifted freight, broken runners, crushed cartons, and wet goods.
          </p>
        </div>

        <Link
          href="/operations/customers/approvals"
          className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
        >
          <span>Open Customer Approval Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Exception Cards */}
      <div className="space-y-4">
        {exceptions.map((ex) => (
          <div
            key={ex.id}
            className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-4 hover:border-[#233f63] transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a3353] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-white">{ex.id}</span>
                <SeverityBadge severity={ex.severity} />
                <span className="text-xs font-bold text-slate-300">Job {ex.jobId}</span>
              </div>
              <ApprovalBadge status={ex.approvalStatus} />
            </div>

            <div>
              <h2 className="text-base font-bold text-white">{ex.title}</h2>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-4xl">
                {ex.description}
              </p>
            </div>

            {/* Photos & Evidence */}
            {ex.photos.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Photographic Evidence Stamped on Dock</span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {ex.photos.map((src, i) => (
                    <div
                      key={i}
                      className="w-36 h-24 rounded-lg bg-[#060d17] border border-[#233f63] overflow-hidden relative shrink-0"
                    >
                      <img
                        src={src}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions & Resolution */}
            <div className="pt-3 border-t border-[#1a3353] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-400">
                <span>Reported by: <strong className="text-slate-200">{ex.reportedBy}</strong></span>
                {ex.additionalCost && (
                  <span className="ml-3 font-mono font-bold text-emerald-400">
                    Est. Quote: +${ex.additionalCost.toFixed(2)}
                  </span>
                )}
              </div>

              {ex.customerApprovalRequired && ex.approvalStatus === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateExceptionApproval(ex.id, "approved", "Customer Portal (Demo)")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
                  >
                    Simulate Customer Sign-Off →
                  </button>
                  <button
                    onClick={() => updateExceptionApproval(ex.id, "waived", "Terminal Manager")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                  >
                    Waive Approval
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
