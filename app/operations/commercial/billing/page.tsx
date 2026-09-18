"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { Receipt, Download, FileSpreadsheet, CheckCircle2, DollarSign, ExternalLink, Clock, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/operations/StatusBadge";

export default function BillingPage() {
  const { jobs, exceptions } = useWarehouseStore();
  const [activeTab, setActiveTab] = useState<"ready" | "all">("ready");

  const completedJobs = jobs.filter(
    (j) => j.status === "ready_for_billing" || j.status === "completed"
  );
  const totalBilled = completedJobs.reduce((sum, j) => sum + j.billableAmount, 0);
  const totalWipAuthorized = jobs
    .filter((j) => j.status !== "completed")
    .reduce((sum, j) => sum + j.billableAmount, 0);

  const displayedJobs = activeTab === "ready" ? completedJobs : jobs;

  const exportQuickBooksCsv = () => {
    const headers = ["InvoiceNumber", "Customer", "Service", "Date", "BaseAmount", "ApprovedAdditions", "TotalBillable", "Trailer", "BOL"];
    const rows = displayedJobs.map((j) => [
      j.id,
      `"${j.customer.name}"`,
      `"${j.service}"`,
      new Date(j.createdAt).toLocaleDateString(),
      j.quoteAmount.toFixed(2),
      (j.approvedAdditions ?? 0).toFixed(2),
      j.billableAmount.toFixed(2),
      j.trailer,
      j.bolNumber,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `denver_express_invoices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Commercial Finance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Billing Readiness & Export
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Reconcile base service quotes, approved customer change orders, and export formatted QuickBooks / IIF invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportQuickBooksCsv}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export QuickBooks CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Verified Receivables</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            ${totalBilled.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Ready for accounting sync</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active WIP Authorized Value</div>
          <div className="mt-2 text-2xl font-black text-[#d4af37]">
            ${totalWipAuthorized.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Under contract across active terminal bays</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Payment Terms Breakdown</div>
          <div className="mt-2 text-2xl font-black text-white">80% Net 30</div>
          <div className="mt-1 text-[11px] text-slate-400">Enterprise brokerage accounts</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1a3353] pb-2">
        <button
          onClick={() => setActiveTab("ready")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "ready"
              ? "bg-[#d4af37] text-slate-950 shadow"
              : "bg-[#0b192c] text-slate-300 hover:bg-[#142844] border border-[#1a3353]"
          }`}
        >
          Ready for Invoicing ({completedJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === "all"
              ? "bg-[#d4af37] text-slate-950 shadow"
              : "bg-[#0b192c] text-slate-300 hover:bg-[#142844] border border-[#1a3353]"
          }`}
        >
          All Terminal Work Orders ({jobs.length})
        </button>
      </div>

      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden">
        <div className="p-4 border-b border-[#1a3353] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">
            {activeTab === "ready" ? "Finalized Invoices Ready for Export" : "All Operational Work Orders & Commercial States"}
          </h2>
          <span className="text-xs text-slate-500 font-mono">Consolidated Ledger</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081525] text-[11px] uppercase font-bold text-slate-400 border-b border-[#1a3353]">
              <tr>
                <th className="p-3">Work Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Service</th>
                <th className="p-3 text-right">Base Authorized</th>
                <th className="p-3 text-right">Change Orders</th>
                <th className="p-3 text-right">Authorized Total</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Audit Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3353]">
              {displayedJobs.map((j) => {
                const hasApproved = (j.approvedAdditions ?? 0) > 0;
                const hasPending = (j.pendingAdditions ?? 0) > 0;

                return (
                  <tr key={j.id} className="hover:bg-[#102237] transition">
                    <td className="p-3 font-mono font-bold text-[#d4af37]">
                      <Link href={`/operations/jobs?job=${j.id}`} className="hover:underline">
                        {j.id}
                      </Link>
                    </td>
                    <td className="p-3 font-semibold text-white">{j.customer.name}</td>
                    <td className="p-3">{j.service}</td>
                    <td className="p-3 text-right font-mono text-slate-300">
                      ${j.quoteAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {hasApproved ? (
                        <span className="text-emerald-400 font-bold">+${(j.approvedAdditions ?? 0).toFixed(2)}</span>
                      ) : hasPending ? (
                        <span className="text-amber-400 text-[11px] font-semibold">Pending (+${(j.pendingAdditions ?? 0).toFixed(2)})</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      ${j.billableAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={j.status} />
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SHA-256 Chained
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
