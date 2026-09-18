"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useWarehouseStore } from "@/lib/domain/store";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Truck,
  Phone,
  Mail,
  ChevronRight,
  Maximize2,
  X,
  Check,
  Building,
  ArrowRight,
} from "lucide-react";
import { ExceptionLifecycleBadge, SeverityBadge } from "@/components/operations/StatusBadge";

export default function CustomerApprovalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const exceptionId = resolvedParams.id;

  const {
    exceptions,
    jobs,
    pallets,
    locations,
    recordCustomerView,
    approveChangeOrder,
    holdFreight,
  } = useWarehouseStore();

  const [approverName, setApproverName] = useState("Tom Bradley");
  const [approverEmail, setApproverEmail] = useState("tbradley@rockymountainbev.com");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [holdNotes, setHoldNotes] = useState("Holding pallet while awaiting repack packaging instructions.");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const exception = exceptions.find((e) => e.id.toLowerCase() === exceptionId.toLowerCase()) || exceptions[0];
  const relatedJob = jobs.find((j) => j.id === exception?.jobId);
  const affectedPallet = pallets.find((p) => p.id === exception?.palletId);

  // Automatically record customer view on initial load
  useEffect(() => {
    if (exception?.id) {
      recordCustomerView(exception.id, `${approverName} (Rocky Mountain Beverage Co)`);
    }
  }, [exception?.id, recordCustomerView, approverName]);

  const changeCost = exception?.changeOrderAmount ?? exception?.additionalCost ?? 285.0;
  const baseAuthorized = relatedJob?.quoteAmount ?? 450.0;
  const newTotal = baseAuthorized + changeCost;

  const handleApprove = () => {
    if (!exception) return;
    approveChangeOrder(exception.id, approverName, approverEmail);
    setShowConfirmModal(false);
    setActionSuccessMessage(`Change order authorized successfully for $${changeCost.toFixed(2)}. Operations dispatch notified.`);
  };

  const handleHold = () => {
    if (!exception) return;
    holdFreight(exception.id, holdNotes);
    setShowHoldModal(false);
    setActionSuccessMessage("Freight hold registered. Warehouse has halted restack labor on this unit.");
  };

  const isAlreadyApproved = exception?.status === "approved" || exception?.status === "in_progress" || exception?.status === "resolved";
  const isDeclinedOrHeld = exception?.status === "declined" || exception?.resolutionState === "held";

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-100 antialiased font-sans pb-16">
      {/* Header Bar */}
      <header className="border-b border-[#1a3353] bg-[#0b192c]/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-[#060d17] font-black text-sm tracking-wider shadow-md">
              DX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">DENVER EXPRESS</span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-[#d4af37] border border-amber-500/30">
                  Customer Authorization Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Facility: 6030 Washington St, Ste 130, Denver CO 80216 • Simulated Operations Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Demo Authorization Link</span>
            </div>
            <Link
              href="/operations/command-center"
              className="text-xs text-slate-400 hover:text-white transition px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500"
            >
              Operator View ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Success Alert Banner if just acted */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-sm font-semibold">{actionSuccessMessage}</div>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-400 hover:text-white text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Status Callout Banner */}
        {isAlreadyApproved ? (
          <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Change Order Approved & Authorized</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    ${changeCost.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Authorized by <strong className="text-white">{exception.approvedBy || approverName}</strong> on{" "}
                  {new Date(exception.approvedAt || exception.approvalDecisionTime || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  . Corrective restack work has been queued for warehouse technicians.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-emerald-400 font-mono font-bold">Authorized Total: ${newTotal.toFixed(2)}</span>
            </div>
          </div>
        ) : isDeclinedOrHeld ? (
          <div className="p-4 rounded-xl bg-amber-900/30 border border-amber-500/40 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-amber-200">
              <strong>Freight On Quarantine Hold:</strong> Additional rework was declined or held by shipper. Pallet remains
              buffered in warehouse quarantine. Contact dispatch for carrier disposition.
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Action Required: Authorization Needed to Proceed with Rework</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    +${changeCost.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Severe load shift was discovered during inbound inspection. Freight cannot safely travel without corrective rebuilding.
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 shrink-0"
            >
              <span>Authorize Quote (${changeCost.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Grid: Context & Shipment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Shipment Card */}
          <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Shipment Reference
              </span>
              <span className="font-mono text-xs font-bold text-white">{relatedJob?.id || "DX-260918-037"}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#142844]">
                <span className="text-slate-400">Carrier / SCAC:</span>
                <span className="font-medium text-slate-200">
                  {relatedJob?.carrier.name || "Regional Hotshot Logistics"} ({relatedJob?.carrier.scac || "RHLX"})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142844]">
                <span className="text-slate-400">Trailer ID:</span>
                <span className="font-mono font-bold text-amber-400">{relatedJob?.trailer || "RMB-5012"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142844]">
                <span className="text-slate-400">Dock Bay:</span>
                <span className="text-slate-200">{relatedJob?.dockDoor || "Door 3 (Inbound)"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142844]">
                <span className="text-slate-400">Inbound Seal:</span>
                <span className="font-mono text-emerald-400">SL-501201 (Intact)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Bill of Lading:</span>
                <span className="font-mono text-slate-200">{relatedJob?.bolNumber || "BOL-44910-RMB"}</span>
              </div>
            </div>
          </div>

          {/* Account Card */}
          <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                Customer Account
              </span>
              <span className="text-xs text-slate-400 font-mono">CUST-005</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#142844]">
                <span className="text-slate-400">Company:</span>
                <span className="font-bold text-white">{relatedJob?.customer.name || "Rocky Mountain Beverage Co"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142844]">
                <span className="text-slate-400">Authorized Contact:</span>
                <span className="text-slate-200 font-medium">Tom Bradley</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142844]">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300 font-mono">tbradley@rockymountainbev.com</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142844]">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-300 font-mono">(303) 555-0142</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Payment Terms:</span>
                <span className="text-emerald-400 font-medium">Net-30 Enterprise Credit</span>
              </div>
            </div>
          </div>

          {/* Authorization State Card */}
          <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Authorization Status
                </span>
                <ExceptionLifecycleBadge status={exception.status} />
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#142844]">
                  <span className="text-slate-400">Discovered:</span>
                  <span className="text-slate-200">{exception.discoveredTime || "11:06 AM"} by Marco S.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#142844]">
                  <span className="text-slate-400">Bay Location:</span>
                  <span className="font-mono text-amber-300 font-bold">{exception.location || "Bay RW-01"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Affected Unit:</span>
                  <span className="font-mono font-bold text-white">{exception.palletId || "DX-260918-037-P08"}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full py-1.5 rounded-lg bg-[#142844] hover:bg-[#1a355c] text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Call Warehouse Dispatch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section: Photographic Evidence & Inspection Details */}
        <div className="p-6 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a3353] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-white">{exception.id}</span>
                <span className="text-slate-400">•</span>
                <h2 className="text-lg font-black text-white tracking-tight">{exception.title}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Target Freight: <strong className="text-slate-200">Pallet 8 of 8</strong> (Craft Beverage Glass Bottled Goods)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={exception.severity} />
              <span className="text-xs text-slate-400">Discovered in <strong className="text-amber-400">Bay RW-01</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Description & Remedy */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Inspector Findings & Cause
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed bg-[#060d17] p-3.5 rounded-lg border border-[#142844]">
                  {exception.description}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-1">
                  Illustrative Corrective Scope of Work (Demo Protocol)
                </h3>
                <div className="text-xs text-slate-200 bg-[#060d17] p-3.5 rounded-lg border border-[#142844] space-y-2">
                  <div className="font-semibold text-slate-100">Illustrative Rework Protocol (Demo SOP-04): Full Manual Breakdown & Plumb Rebuild</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                    <li>Carefully de-stack 72 cartons of bottled soda to prevent bottle rupture.</li>
                    <li>Discard fractured hardwood runner; provide certified Grade-A GMA exchange pallet.</li>
                    <li>Inspect every layer for liquid seepage or micro-fractured glass seals.</li>
                    <li>Hand-stack in interlocked pinwheel configuration onto new pallet.</li>
                    <li>Apply 4 full-length heavy-duty corner boards and machine stretch wrap (80 gauge, 18-layer pre-stretch).</li>
                    <li>Apply 4 high-tensile polyester bands with metal crimp seals.</li>
                    <li>Verify laser vertical plumbness (<strong className="text-emerald-400">&lt;1° deviation</strong>) prior to staging in Bay ST-03.</li>
                  </ol>
                  <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
                    *Tolerances, equipment, and materials listed above are representative demo specifications and do not represent verified Denver Express company policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Photographic Inspection Gallery */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Photographic Defect Documentation ({exception.photos?.length || 0} Photos)
                </h3>
                <span className="text-[11px] text-slate-500">Click photo to zoom</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exception.photos?.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative rounded-lg bg-black border border-[#233f63] overflow-hidden aspect-[4/3] cursor-pointer hover:border-amber-400 transition"
                  >
                    <img
                      src={photo}
                      alt={`Defect ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white">
                      <span className="font-medium">Photo {i + 1}: Inbound Defect</span>
                      <Maximize2 className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-[#060d17] border border-[#142844] text-[11px] text-slate-400">
                <strong className="text-slate-300">Timestamp:</strong> Photographed at 11:06 AM MST by Marco S. (FL-01 camera capture). Chain-of-custody recorded in operational ledger.
              </div>
            </div>
          </div>
        </div>

        {/* Section: Commercial Breakdown & Authorization Decision */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#0b192c] to-[#0d223f] border border-[#1a3353] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a3353] pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                Commercial Authorization Statement
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Cost Breakdown & Authorization Terms
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Billing Terms:</span>
              <div className="text-sm font-bold text-white">Consolidated Invoice (Net-30)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Breakdown Table */}
            <div className="lg:col-span-2 space-y-3">
              <div className="rounded-lg bg-[#060d17] border border-[#142844] overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0b192c] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-[#142844]">
                    <tr>
                      <th className="py-2.5 px-4">Line Item / Scope</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Qty / Hours</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#142844]">
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        Base Authorized Rework (Job DX-260918-037)
                        <div className="text-[11px] text-slate-500">Initial intake, transload & staging of 7 pallets</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                          BASE CONTRACT
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">Flat Fee</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                        ${baseAuthorized.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-amber-950/20">
                      <td className="py-3 px-4 font-medium text-amber-200">
                        Emergency Manual Pallet Rebuild (Pallet P08)
                        <div className="text-[11px] text-slate-400">
                          Hand un-case, bottle integrity inspect, Grade-A wood pallet exchange
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[10px]">
                          CHANGE ORDER
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-amber-300 font-mono">1.5 Tech-Hrs</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                        $195.00
                      </td>
                    </tr>
                    <tr className="bg-amber-950/20">
                      <td className="py-3 px-4 font-medium text-amber-200">
                        Grade-A GMA Hardwood Exchange Pallet (Certified)
                        <div className="text-[11px] text-slate-400">Replaces fractured lower structural runner</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[10px]">
                          MATERIALS
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-amber-300 font-mono">1 Unit</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                        $25.00
                      </td>
                    </tr>
                    <tr className="bg-amber-950/20">
                      <td className="py-3 px-4 font-medium text-amber-200">
                        High-Tension Machine Stretch Wrap + 4 Edge Boards + Strapping
                        <div className="text-[11px] text-slate-400">80-gauge poly film, 4 full corner boards, 4 poly bands</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[10px]">
                          MATERIALS
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-amber-300 font-mono">1 Set</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                        $65.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-lg bg-[#060d17] border border-[#142844] text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Legal Authorization Note:</strong> Approving this change order authorizes Denver Express to perform the specialized manual rebuild of Pallet P08. The fee of ${changeCost.toFixed(2)} will be added to your consolidated billing invoice under Work Order DX-260918-037.
              </div>
            </div>

            {/* Total Summary & Action Box */}
            <div className="p-5 rounded-xl bg-[#060d17] border border-[#233f63] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Financial Summary
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#142844]">
                    <span className="text-slate-400">Base Contract Work:</span>
                    <span className="font-mono text-slate-200">${baseAuthorized.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#142844]">
                    <span className="text-amber-400 font-semibold">Change Order EX-1049:</span>
                    <span className="font-mono font-bold text-amber-400">+${changeCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-bold border-b-2 border-emerald-500/40">
                    <span className="text-white">Authorized Total if Approved:</span>
                    <span className="font-mono text-emerald-400 text-lg">${newTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0b192c] border border-[#1a3353] text-[11px] text-slate-400">
                  {isAlreadyApproved ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Authorized by {exception.approvedBy || approverName}
                    </span>
                  ) : isDeclinedOrHeld ? (
                    <span className="text-amber-400 font-medium">
                      Freight on Hold: Current authorized total is ${baseAuthorized.toFixed(2)}.
                    </span>
                  ) : (
                    <span>
                      Current authorized total: <strong className="text-white">${baseAuthorized.toFixed(2)}</strong>.
                      Increases to <strong className="text-emerald-400">${newTotal.toFixed(2)}</strong> upon approval.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {!isAlreadyApproved && !isDeclinedOrHeld ? (
                  <>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorize Change Order (${changeCost.toFixed(2)})</span>
                    </button>

                    <button
                      onClick={() => setShowHoldModal(true)}
                      className="w-full py-2.5 rounded-lg bg-[#142844] hover:bg-[#1a355c] text-rose-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-rose-500/20 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline & Place Freight on Hold</span>
                    </button>
                  </>
                ) : isAlreadyApproved ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Change Order Approved (${changeCost.toFixed(2)})</span>
                    </div>
                    <Link
                      href={`/operations/jobs?job=${relatedJob?.id || "DX-260918-037"}`}
                      className="w-full py-2 rounded-lg bg-[#142844] hover:bg-[#1a355c] text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Track Job in Operations Console</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-semibold text-center">
                      Freight on Hold in Bay RW-01
                    </div>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Re-open & Authorize Rework (${changeCost.toFixed(2)})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Audit & Activity Log */}
        <div className="p-5 rounded-xl bg-[#0b192c] border border-[#1a3353] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1a3353] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Chain-of-Custody & Authorization Audit Trail
            </span>
            <span className="text-[11px] text-slate-500">Immutable Log</span>
          </div>

          <div className="space-y-2 pt-1">
            {exception.auditHistory && exception.auditHistory.length > 0 ? (
              exception.auditHistory.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs py-1.5 border-b border-[#142844] last:border-0">
                  <div className="w-20 shrink-0 font-mono text-[11px] text-slate-400">
                    {entry.timestamp.includes("T")
                      ? new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : entry.timestamp}
                  </div>
                  <div className="w-32 shrink-0 font-semibold text-amber-300">
                    {entry.action.replace("_", " ")}
                  </div>
                  <div className="flex-1 text-slate-300">
                    <span className="font-medium text-slate-200">[{entry.actor}]</span>{" "}
                    {entry.notes || entry.details}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic py-2">No audit entries recorded yet.</div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: Confirmation / Electronic Signature */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#233f63] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                  Electronic Authorization
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Authorize Change Order EX-1049
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-[#060d17] border border-[#142844] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Freight Job:</span>
                <span className="font-mono text-white">{relatedJob?.id} (Trailer {relatedJob?.trailer})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Affected Unit:</span>
                <span className="font-mono text-amber-300">{exception.palletId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Additional Cost:</span>
                <span className="font-mono font-bold text-emerald-400">+${changeCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-[#142844]">
                <span className="text-slate-300">New Authorized Total:</span>
                <span className="font-mono text-emerald-400 text-sm">${newTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Signature Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Authorized Signer Full Name
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060d17] border border-[#1a3353] text-sm text-white focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Tom Bradley"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Signer Work Email
                </label>
                <input
                  type="email"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060d17] border border-[#1a3353] text-sm text-white focus:outline-none focus:border-amber-400"
                  placeholder="e.g. tbradley@rockymountainbev.com"
                />
              </div>

              <label className="flex items-start gap-2.5 pt-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-[#060d17] border-slate-600 text-emerald-500 focus:ring-0"
                />
                <span>
                  I represent Rocky Mountain Beverage Co and authorize Denver Express to execute corrective rework as scoped above for $285.00, to be added to consolidated job billing.
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!agreedToTerms || !approverName.trim()}
                onClick={handleApprove}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Authorize</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hold Freight */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-rose-900/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                  Decline & Quarantine Hold
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Place Freight on Hold
                </h3>
              </div>
              <button onClick={() => setShowHoldModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If you decline this rework quote, Denver Express will halt all rebuild activity on Pallet P08. The pallet will be moved to designated quarantine staging in Bay RW-01 buffer. No additional rework charges will be incurred.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hold Instructions / Reason for Disposition
              </label>
              <textarea
                value={holdNotes}
                onChange={(e) => setHoldNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[#060d17] border border-[#1a3353] text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHoldModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleHold}
                className="flex-1 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold shadow-lg transition cursor-pointer"
              >
                Confirm Freight Hold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Contact Warehouse Dispatch */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#233f63] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                  Denver Express Dispatch
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Warehouse Direct Contact
                </h3>
              </div>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#060d17] border border-[#142844] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Phone className="w-4 h-4 text-[#d4af37]" />
                  <span>Simulated Dispatch Desk (Demo):</span>
                </div>
                <div className="font-mono text-base font-bold text-amber-400 pl-6">
                  (303) 555-0199 <span className="text-[11px] font-normal text-slate-400">(Demo Hotline)</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-6">
                  Illustrative terminal dispatch contact for simulation and walkthrough testing.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#060d17] border border-[#142844] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                  <span>Operations Email:</span>
                </div>
                <div className="font-mono text-sm text-slate-200 pl-6">
                  dispatch@denverexpresstrucking.com
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#060d17] border border-[#142844] text-[11px] text-slate-400">
                <strong>Terminal Location:</strong> 6030 Washington St, Suite 130, Denver, CO 80216.
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN PHOTO VIEWER */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="Full inspection view"
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-slate-800"
            />
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="h-8 w-8 rounded-full bg-black/80 text-white flex items-center justify-center border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center text-xs text-slate-400 mt-2">
              EX-1049 • High-resolution forensic defect inspection • Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
