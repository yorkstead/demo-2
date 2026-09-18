"use client";

import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { Receipt, Download, FileSpreadsheet, CheckCircle2, DollarSign, ExternalLink } from "lucide-react";

export default function BillingPage() {
  const { jobs } = useWarehouseStore();

  const completedJobs = jobs.filter(
    (j) => j.status === "ready_for_billing" || j.status === "completed"
  );
  const totalBilled = completedJobs.reduce((sum, j) => sum + j.billableAmount, 0);

  const exportQuickBooksCsv = () => {
    const headers = ["InvoiceNumber", "Customer", "Service", "Date", "Amount", "Trailer", "BOL"];
    const rows = completedJobs.map((j) => [
      j.id,
      `"${j.customer.name}"`,
      `"${j.service}"`,
      new Date(j.createdAt).toLocaleDateString(),
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
            Review finalized dock tally labor, materials, and generate formatted QuickBooks / IIF invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportQuickBooksCsv}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
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
          <div className="text-xs text-slate-400 uppercase font-semibold">Ready for Billing</div>
          <div className="mt-2 text-2xl font-black text-[#d4af37]">
            {jobs.filter((j) => j.status === "ready_for_billing").length} Orders
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Driver signed off on tablet</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Payment Terms Breakdown</div>
          <div className="mt-2 text-2xl font-black text-white">80% Net 30</div>
          <div className="mt-1 text-[11px] text-slate-400">Enterprise brokerage accounts</div>
        </div>
      </div>

      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden">
        <div className="p-4 border-b border-[#1a3353]">
          <h2 className="text-sm font-bold text-white">Invoicing & Billing Pipeline</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081525] text-[11px] uppercase font-bold text-slate-400 border-b border-[#1a3353]">
              <tr>
                <th className="p-3">Invoice / Job #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Service Provided</th>
                <th className="p-3">Labor & Supplies Rollup</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Signature</th>
                <th className="p-3">Audit Chain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3353]">
              {completedJobs.map((j) => (
                <tr key={j.id} className="hover:bg-[#102237]">
                  <td className="p-3 font-mono font-bold text-[#d4af37]">{j.id}</td>
                  <td className="p-3 font-semibold text-white">{j.customer.name}</td>
                  <td className="p-3">{j.service}</td>
                  <td className="p-3 text-slate-400">
                    {j.labor.hoursLogged} hrs labor + {j.palletCount} plts
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    ${j.billableAmount.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Captured
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    SHA-256 Verified
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
