"use client";

import { useState } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { StatusBadge, BillingReadinessBadge } from "@/components/operations/StatusBadge";
import { DocumentationChecklist } from "@/components/operations/DocumentationChecklist";
import { buildJobDocumentation } from "@/lib/domain/documentation";
import { BillingReadinessStatus, WarehouseJob } from "@/lib/domain/types";
import {
  Receipt,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Clock,
  AlertTriangle,
  FileCheck,
  Printer,
  X,
  Search,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";

export default function BillingPage() {
  const { jobs, pallets, exceptions, reviewAndApproveBilling, markJobInvoiced } = useWarehouseStore();
  const [activeStatusTab, setActiveStatusTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [reviewJobId, setReviewJobId] = useState<string | null>(null);

  // Financial aggregates
  const readyOrInvoicedJobs = jobs.filter(
    (j) => j.billingReadinessStatus === "ready_to_invoice" || j.billingReadinessStatus === "invoiced"
  );
  const totalInvoicedOrReady = readyOrInvoicedJobs.reduce((sum, j) => sum + j.billableAmount, 0);
  const totalWipAuthorized = jobs
    .filter((j) => j.billingReadinessStatus !== "invoiced")
    .reduce((sum, j) => sum + (j.authorizedAmount ?? j.billableAmount), 0);

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesTab =
      activeStatusTab === "all" ? true : (j.billingReadinessStatus ?? "wip") === activeStatusTab;

    const matchesSearch =
      j.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.trailer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.bolNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const selectedReviewJob = reviewJobId ? jobs.find((j) => j.id === reviewJobId) : null;
  const reviewPallets = selectedReviewJob ? pallets.filter((p) => p.jobId === selectedReviewJob.id) : [];
  const reviewExceptions = selectedReviewJob ? exceptions.filter((e) => e.jobId === selectedReviewJob.id) : [];
  const reviewDocs = selectedReviewJob ? buildJobDocumentation(selectedReviewJob, reviewPallets, reviewExceptions) : null;

  const exportQuickBooksCsv = () => {
    const headers = [
      "InvoiceNumber",
      "Customer",
      "Service",
      "Date",
      "BaseQuoted",
      "ApprovedAdditions",
      "StorageAmount",
      "TotalAuthorized",
      "TotalPerformed",
      "TotalBillable",
      "ReadinessStatus",
      "Trailer",
      "BOL",
    ];
    const rows = filteredJobs.map((j) => [
      j.id,
      `"${j.customer.name}"`,
      `"${j.service}"`,
      new Date(j.createdAt).toLocaleDateString(),
      j.quoteAmount.toFixed(2),
      (j.approvedAdditions ?? 0).toFixed(2),
      (j.storageAmount ?? 0).toFixed(2),
      (j.authorizedAmount ?? j.billableAmount).toFixed(2),
      (j.performedAmount ?? j.quoteAmount).toFixed(2),
      j.billableAmount.toFixed(2),
      j.billingReadinessStatus ?? "wip",
      j.trailer,
      j.bolNumber,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `denver_express_billing_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusTabs: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All Work Orders", count: jobs.length },
    { key: "wip", label: "WIP", count: jobs.filter((j) => (j.billingReadinessStatus ?? "wip") === "wip").length },
    {
      key: "awaiting_authorization",
      label: "Awaiting Auth",
      count: jobs.filter((j) => j.billingReadinessStatus === "awaiting_authorization").length,
    },
    {
      key: "authorized_work_pending",
      label: "Auth / Work Pending",
      count: jobs.filter((j) => j.billingReadinessStatus === "authorized_work_pending").length,
    },
    {
      key: "needs_documentation",
      label: "Needs Docs",
      count: jobs.filter((j) => j.billingReadinessStatus === "needs_documentation").length,
    },
    {
      key: "needs_review",
      label: "Needs Review",
      count: jobs.filter((j) => j.billingReadinessStatus === "needs_review").length,
    },
    {
      key: "ready_to_invoice",
      label: "Ready to Invoice",
      count: jobs.filter((j) => j.billingReadinessStatus === "ready_to_invoice").length,
    },
    {
      key: "invoiced",
      label: "Invoiced",
      count: jobs.filter((j) => j.billingReadinessStatus === "invoiced").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Commercial Operations &amp; Finance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Billing Readiness &amp; Handoff Board
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Reconcile authorized work against completed labor, verify documentation gates, and release invoice-ready records.
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Ready / Invoiced Receivables</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            ${totalInvoicedOrReady.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Verified &amp; released for accounting export</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Authorized Pipeline (WIP)</div>
          <div className="mt-2 text-2xl font-black text-[#d4af37]">
            ${totalWipAuthorized.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Customer authorized across active warehouse jobs</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0b192c] border border-[#1a3353]">
          <div className="text-xs text-slate-400 uppercase font-semibold">Commercial Ledger Rule</div>
          <div className="mt-2 text-sm font-bold text-white">Billable = Authorized ∩ Performed</div>
          <div className="mt-1 text-[11px] text-slate-400">Additions must be both authorized and completed</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatusTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeStatusTab === tab.key
                  ? "bg-[#d4af37] text-slate-950 shadow"
                  : "bg-[#0b192c] text-slate-300 hover:bg-[#142844] border border-[#1a3353]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeStatusTab === tab.key ? "bg-slate-900 text-[#d4af37]" : "bg-[#142844] text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search work order #, customer, trailer, BOL, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#081525] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl bg-[#0b192c] border border-[#1a3353] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1a3353] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#d4af37]" />
            <span>Operational &amp; Commercial Billing Table ({filteredJobs.length} records)</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Consolidated Commercial Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081525] text-[10px] uppercase font-bold text-slate-400 border-b border-[#1a3353]">
              <tr>
                <th className="p-3">Work Order #</th>
                <th className="p-3">Customer &amp; Service</th>
                <th className="p-3">Readiness Status</th>
                <th className="p-3">Documentation</th>
                <th className="p-3 text-right">Quoted Base</th>
                <th className="p-3 text-right">Appr. Adds</th>
                <th className="p-3 text-right">Authorized</th>
                <th className="p-3 text-right">Performed</th>
                <th className="p-3 text-right font-black text-white">Billable</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3353]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 text-xs">
                    No work orders found for selected filter.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => {
                  const jobP = pallets.filter((p) => p.jobId === j.id);
                  const jobE = exceptions.filter((e) => e.jobId === j.id);
                  const doc = buildJobDocumentation(j, jobP, jobE);
                  const authorized = j.authorizedAmount ?? j.billableAmount;
                  const performed = j.performedAmount ?? j.quoteAmount;
                  const billable = j.billableAmount;
                  const hasApprovedAdd = (j.approvedAdditions ?? 0) > 0;
                  const hasPendingAdd = (j.pendingAdditions ?? 0) > 0;

                  return (
                    <tr key={j.id} className="hover:bg-[#102237] transition">
                      <td className="p-3 font-mono font-bold text-[#d4af37]">
                        <Link href={`/operations/jobs?job=${j.id}`} className="hover:underline">
                          {j.id}
                        </Link>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {j.trailer} • {j.bolNumber}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-white">{j.customer.name}</div>
                        <div className="text-[11px] text-slate-400">{j.service}</div>
                      </td>

                      <td className="p-3">
                        <BillingReadinessBadge status={j.billingReadinessStatus ?? "wip"} />
                      </td>

                      <td className="p-3">
                        <DocumentationChecklist
                          job={j}
                          pallets={jobP}
                          exceptions={jobE}
                          variant="compact"
                        />
                      </td>

                      <td className="p-3 text-right font-mono text-slate-300">
                        ${j.quoteAmount.toFixed(2)}
                      </td>

                      <td className="p-3 text-right font-mono">
                        {hasApprovedAdd ? (
                          <span className="text-emerald-400 font-bold">+${(j.approvedAdditions ?? 0).toFixed(2)}</span>
                        ) : hasPendingAdd ? (
                          <span className="text-amber-400 text-[10px] font-semibold">
                            Pending (+${(j.pendingAdditions ?? 0).toFixed(2)})
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="p-3 text-right font-mono font-semibold text-slate-200">
                        ${authorized.toFixed(2)}
                      </td>

                      <td className="p-3 text-right font-mono font-semibold text-[#d4af37]">
                        ${performed.toFixed(2)}
                      </td>

                      <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">
                        ${billable.toFixed(2)}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setReviewJobId(j.id)}
                            className="px-2.5 py-1 rounded bg-[#162b45] hover:bg-[#203a5c] border border-[#233f63] text-[11px] font-bold text-slate-200 transition cursor-pointer"
                          >
                            Review
                          </button>
                          <Link
                            href={`/operations/jobs/${j.id}/packet`}
                            target="_blank"
                            title="Print Certified Job Packet"
                            className="p-1 rounded hover:bg-[#162b45] text-slate-400 hover:text-white transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Drawer / Modal for Job Billing Verification */}
      {selectedReviewJob && reviewDocs && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#233f63] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1a3353] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                  Operational Billing Review
                </span>
                <h3 className="text-lg font-bold text-white">
                  Job Review: {selectedReviewJob.id}
                </h3>
              </div>
              <button
                onClick={() => setReviewJobId(null)}
                className="p-1 rounded-lg hover:bg-[#142844] text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scope and Customer Information */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-[#081525] border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Customer / Account</span>
                <span className="font-bold text-white">{selectedReviewJob.customer.name}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Service Type</span>
                <span className="font-semibold text-slate-200">{selectedReviewJob.service}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Trailer &amp; BOL</span>
                <span className="font-mono text-slate-300">
                  {selectedReviewJob.trailer} • {selectedReviewJob.bolNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Assigned Dock Bay</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedReviewJob.dockDoor || "Door 3"}
                </span>
              </div>
            </div>

            {/* Commercial Breakdown */}
            <div className="p-4 rounded-xl bg-[#081525] border border-slate-800 space-y-2.5 text-xs">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Commercial Reconciliation</span>
                <BillingReadinessBadge status={selectedReviewJob.billingReadinessStatus ?? "wip"} />
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Base Service Quote:</span>
                <span className="font-mono font-semibold">${selectedReviewJob.quoteAmount.toFixed(2)}</span>
              </div>

              {(selectedReviewJob.approvedAdditions ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Approved Change Order Additions:</span>
                  <span className="font-mono font-bold">+${(selectedReviewJob.approvedAdditions ?? 0).toFixed(2)}</span>
                </div>
              )}

              {(selectedReviewJob.pendingAdditions ?? 0) > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Pending Customer Authorization:</span>
                  <span className="font-mono">+${(selectedReviewJob.pendingAdditions ?? 0).toFixed(2)}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Total Authorized</span>
                  <span className="font-mono font-bold text-slate-200">
                    ${(selectedReviewJob.authorizedAmount ?? selectedReviewJob.billableAmount).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Work Performed</span>
                  <span className="font-mono font-bold text-[#d4af37]">
                    ${(selectedReviewJob.performedAmount ?? selectedReviewJob.quoteAmount).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Final Billable</span>
                  <span className="font-mono text-base font-black text-emerald-400">
                    ${selectedReviewJob.billableAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Documentation Checklist Audit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">
                  Audit Gate: 8 Required Documents
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {reviewDocs.completedCount} / {reviewDocs.totalCount} Verified
                </span>
              </div>
              <DocumentationChecklist
                job={selectedReviewJob}
                pallets={reviewPallets}
                exceptions={reviewExceptions}
                variant="detailed"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#1a3353] flex items-center justify-between">
              <Link
                href={`/operations/jobs/${selectedReviewJob.id}/packet`}
                target="_blank"
                className="px-3 py-1.5 rounded-lg bg-[#142844] hover:bg-[#1a3353] border border-[#233f63] text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open Certified Job Packet</span>
              </Link>

              <div className="flex items-center gap-2">
                {selectedReviewJob.billingReadinessStatus !== "invoiced" && (
                  <button
                    onClick={() => {
                      reviewAndApproveBilling(selectedReviewJob.id, "Sarah Lin (Operations Manager)");
                      setReviewJobId(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sign Off &amp; Mark Ready to Invoice</span>
                  </button>
                )}

                {selectedReviewJob.billingReadinessStatus === "ready_to_invoice" && (
                  <button
                    onClick={() => {
                      markJobInvoiced(selectedReviewJob.id, `INV-${Date.now().toString().slice(-6)}`);
                      setReviewJobId(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#c49f27] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <span>Mark Invoiced</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
