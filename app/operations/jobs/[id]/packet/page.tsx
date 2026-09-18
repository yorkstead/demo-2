"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import { buildJobDocumentation } from "@/lib/domain/documentation";
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Truck,
  Layers,
  Wrench,
  DollarSign,
  Package,
} from "lucide-react";

interface JobPacketPageProps {
  params: Promise<{ id: string }>;
}

export default function JobPacketPage({ params }: JobPacketPageProps) {
  const { id } = use(params);
  const { jobs, pallets, exceptions } = useWarehouseStore();

  const job = jobs.find((j) => j.id === id) || jobs[0];
  const jobPallets = pallets.filter((p) => p.jobId === job?.id);
  const jobExceptions = exceptions.filter((e) => e.jobId === job?.id);
  const docCompleteness = buildJobDocumentation(job, jobPallets, jobExceptions);

  const printPacket = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!job) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Job not found.</p>
        <Link href="/operations/jobs" className="text-[#d4af37] underline mt-2 inline-block">
          Return to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-200 print:bg-white print:text-black py-6 px-4 sm:px-8">
      {/* Non-printed action bar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/operations/jobs?job=${job.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Work Order {job.id}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/operations/commercial/billing"
            className="px-3 py-1.5 rounded-lg bg-[#0b192c] hover:bg-[#142844] border border-[#233f63] text-xs font-bold text-slate-300 transition"
          >
            Billing Readiness Board
          </Link>
          <button
            onClick={printPacket}
            className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#c49f27] text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Packet / Save to PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="max-w-4xl mx-auto bg-[#081525] print:bg-white border border-[#1a3353] print:border-none rounded-2xl print:rounded-none shadow-2xl p-6 sm:p-10 space-y-8 print:space-y-6 print:p-0">
        {/* Terminal Header */}
        <div className="border-b-2 border-slate-700 print:border-black pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#d4af37] text-slate-950 font-black flex items-center justify-center text-base print:border print:border-black">
                  DX
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white print:text-black uppercase">
                    Denver Express LLC
                  </h1>
                  <p className="text-[11px] text-slate-400 print:text-slate-600 font-medium">
                    6030 Washington St, Suite 130, Denver, CO 80216 • (303) 555-0199
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-300 print:text-slate-700">
                <span className="font-bold">Official Certified Job Packet</span> &amp; Billing Reconciliation Record
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 print:border-none">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Work Order Tracking #</div>
              <div className="text-2xl font-black font-mono text-[#d4af37] print:text-black">{job.id}</div>
              <div className="text-[11px] font-mono text-slate-400 print:text-slate-600 mt-0.5">
                BOL: {job.bolNumber} • Trailer: {job.trailer}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 print:border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 print:text-slate-600 text-[10px] uppercase block">Customer / Shipper</span>
              <span className="font-bold text-white print:text-black">{job.customer.name}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 text-[10px] uppercase block">Assigned Carrier</span>
              <span className="font-bold text-white print:text-black">{job.carrier.name}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 text-[10px] uppercase block">Intake Date / Time</span>
              <span className="font-mono text-white print:text-black">{new Date(job.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 text-[10px] uppercase block">Operational Stage</span>
              <span className="font-mono font-bold uppercase text-emerald-400 print:text-black">
                {job.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Audit & Compliance Checklist Status */}
        <div className="p-4 rounded-xl bg-[#0b192c] print:bg-slate-50 border border-[#1a3353] print:border-slate-300 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
              <span>Documentation Completeness Verification</span>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400 print:text-emerald-700">
              {docCompleteness.completedCount} / {docCompleteness.totalCount} Complete ({docCompleteness.percent}%)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            {docCompleteness.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-1.5 text-slate-300 print:text-slate-800"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-700 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 print:text-amber-700 shrink-0" />
                )}
                <span className={item.completed ? "" : "text-amber-300 print:text-amber-800"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Freight Manifest & Pallet Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h2 className="font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#d4af37] print:text-black" />
              <span>Pallet-Level Freight Manifest ({jobPallets.length} Units)</span>
            </h2>
            <span className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
              Bay Location: {job.dockDoor || "Door 3"}
            </span>
          </div>

          <div className="border border-[#1a3353] print:border-slate-400 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b192c] print:bg-slate-100 text-[10px] uppercase font-bold text-slate-400 print:text-black border-b border-[#1a3353] print:border-slate-300">
                <tr>
                  <th className="p-2.5">Pallet ID</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5 text-right">Weight</th>
                  <th className="p-2.5">Condition</th>
                  <th className="p-2.5">Quality QA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a3353] print:divide-slate-300 text-slate-300 print:text-black">
                {jobPallets.map((p) => (
                  <tr key={p.id} className="print:leading-tight">
                    <td className="p-2.5 font-mono font-bold text-white print:text-black">{p.id}</td>
                    <td className="p-2.5">{p.skuDescription || "Standard 48x40 Cargo Pallet"}</td>
                    <td className="p-2.5 font-mono font-bold text-[#d4af37] print:text-black">{p.currentLocation}</td>
                    <td className="p-2.5 text-right font-mono">{p.weightLbs.toLocaleString()} lbs</td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.condition === "leaning"
                            ? "bg-rose-950 text-rose-300 print:text-rose-800 border border-rose-500/40"
                            : p.condition === "restacked"
                            ? "bg-emerald-950 text-emerald-300 print:text-emerald-800 border border-emerald-500/40"
                            : "text-slate-400 print:text-slate-700"
                        }`}
                      >
                        {p.condition.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-emerald-400 print:text-emerald-800">
                      {p.condition === "restacked" ? "QA Plumb Passed (<1°)" : "Verified Good"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Work Performed & Customer Authorization Proof */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Work Performed & Labor */}
          <div className="p-4 rounded-xl bg-[#0b192c] print:bg-slate-50 border border-[#1a3353] print:border-slate-300 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-400 print:text-amber-800" />
              <span>Corrective Work Performed</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300 print:text-slate-800">
              <div className="flex justify-between border-b border-slate-800 print:border-slate-200 pb-1.5">
                <span className="text-slate-400 print:text-slate-600">Assigned Technician:</span>
                <span className="font-bold text-white print:text-black">{job.labor.assignedTech}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 print:border-slate-200 pb-1.5">
                <span className="text-slate-400 print:text-slate-600">Total Labor Logged:</span>
                <span className="font-mono font-bold text-emerald-400 print:text-emerald-700">
                  {job.labor.hoursLogged} Hours
                </span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block mb-1">Materials &amp; Equipment Used:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300 print:text-slate-700">
                  <li>2× Grade-A 48×40 Hardwood Pallets</li>
                  <li>2× Heavy-Duty 80-Gauge Stretch Film Rolls</li>
                  <li>4× High-Tensile Heavy-Duty Poly Bands</li>
                  <li>8× Reinforced Corner Boards</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Customer Change Order Authorization */}
          <div className="p-4 rounded-xl bg-[#0b192c] print:bg-slate-50 border border-[#1a3353] print:border-slate-300 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
              <span>Customer Authorization Record</span>
            </div>
            {jobExceptions.map((ex) => (
              <div key={ex.id} className="space-y-2 text-xs text-slate-300 print:text-slate-800">
                <div className="flex justify-between border-b border-slate-800 print:border-slate-200 pb-1.5">
                  <span className="text-slate-400 print:text-slate-600">Change Order ID:</span>
                  <span className="font-mono font-bold text-[#d4af37] print:text-black">{ex.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 print:border-slate-200 pb-1.5">
                  <span className="text-slate-400 print:text-slate-600">Authorization Status:</span>
                  <span className="font-bold uppercase text-emerald-400 print:text-emerald-800">
                    {ex.status === "resolved" ? "Approved & Completed" : ex.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 print:border-slate-200 pb-1.5">
                  <span className="text-slate-400 print:text-slate-600">Authorized Signer:</span>
                  <span className="font-bold text-white print:text-black">
                    {ex.approvedBy || "Tom Bradley (Rocky Mountain Beverage Co)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-600">Audit Verification:</span>
                  <span className="font-mono text-[11px] text-emerald-400 print:text-emerald-700">
                    {ex.approvedAt ? new Date(ex.approvedAt).toLocaleString() : "Timestamped Authorization"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commercial Invoice-Ready Reconciliation */}
        <div className="p-5 rounded-xl bg-[#0b192c] print:bg-white border-2 border-[#1a3353] print:border-black space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 print:border-black pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white print:text-black flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400 print:text-black" />
                <span>Commercial Invoice Reconciliation</span>
              </h3>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                Single authoritative total based on authorized and performed work.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-slate-600 block">Payment Terms</span>
              <span className="font-bold text-white print:text-black text-xs">Net 30 Brokerage</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300 print:text-slate-800">
              <span>Base Freight Rescue Work Order ({job.palletCount} pallets):</span>
              <span className="font-mono font-bold text-white print:text-black">${job.quoteAmount.toFixed(2)}</span>
            </div>

            {(job.approvedAdditions ?? 0) > 0 && (
              <div className="flex justify-between text-emerald-400 print:text-emerald-800 font-semibold">
                <span>Approved Change Order EX-1049 (Emergency Re-palletize &amp; Band P08):</span>
                <span className="font-mono font-bold">+${(job.approvedAdditions ?? 0).toFixed(2)}</span>
              </div>
            )}

            {(job.storageAmount ?? 0) > 0 && (
              <div className="flex justify-between text-slate-300 print:text-slate-800">
                <span>Cross-Dock Transient Staging:</span>
                <span className="font-mono font-bold">+${(job.storageAmount ?? 0).toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t-2 border-slate-700 print:border-black flex justify-between items-center text-base font-black">
              <span className="text-white print:text-black uppercase">Final Certified Billable Total:</span>
              <span className="font-mono text-2xl text-emerald-400 print:text-black">
                ${job.billableAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures & Certification Block */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-400 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="border-b border-slate-600 print:border-black pb-8"></div>
            <div className="mt-1 text-[11px] text-slate-400 print:text-slate-600">
              Denver Express Terminal Manager Signature / Date
            </div>
          </div>
          <div>
            <div className="border-b border-slate-600 print:border-black pb-8"></div>
            <div className="mt-1 text-[11px] text-slate-400 print:text-slate-600">
              Customer / Receiving Carrier Representative Signature / Date
            </div>
          </div>
        </div>

        {/* Footer Disclaimers */}
        <div className="text-[10px] text-slate-500 print:text-slate-600 text-center border-t border-slate-800 print:border-slate-300 pt-3">
          Denver Express LLC • 6030 Washington St, Suite 130, Denver, CO 80216 • Illustrative Demo Job Packet DX-260918-037
        </div>
      </div>
    </div>
  );
}
