"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrivalEta } from "@/components/arrival-eta";
import {
  AlertTriangle,
  Layers,
  Container,
  Clock,
  MapPin,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Smartphone,
  ExternalLink,
} from "lucide-react";

export default function ReserveBayPage() { return <Suspense><ReserveBayContent /></Suspense>; }
function ReserveBayContent() {
  const params = useSearchParams();
  const requestId = useRef<string | null>(null);
  const [serviceType, setServiceType] = useState<"Shifted Pallets" | "Axle Rebalance" | "Pallet Swap" | "Floor Transload">("Shifted Pallets");
  const [palletCount, setPalletCount] = useState(8);
  const [trailerNumber, setTrailerNumber] = useState("SWFT-55219");
  const [carrierName, setCarrierName] = useState("Swift Transportation");
  const [driverName, setDriverName] = useState("Marcus Vance");
  const [driverPhone, setDriverPhone] = useState("(720) 555-0194");
  const [eta, setEta] = useState("30 Mins");
  const [assignedBay, setAssignedBay] = useState(() => {
    if (typeof window !== "undefined") {
      const b = new URLSearchParams(window.location.search).get("bay");
      if (b) return b;
    }
    return "Bay 2";
  });

  const sessionId = params.get("session") || "demo-main";

  const [submitting, setSubmitting] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<{
    id: string;
    bayNumber: string;
    holdUntil: string;
    eta?: string;
    createdAt: string;
  } | null>(null);

  // Calculate estimated price range
  const getEstimatedRange = () => {
    let base = 250;
    if (serviceType === "Shifted Pallets") base = 350 + palletCount * 18;
    if (serviceType === "Axle Rebalance") base = 350;
    if (serviceType === "Pallet Swap") base = 280 + palletCount * 22;
    if (serviceType === "Floor Transload") base = 500 + palletCount * 16;

    const low = Math.round(base * 0.95);
    const high = Math.round(base * 1.25);
    return { low, high, avg: Math.round((low + high) / 2) };
  };

  const range = getEstimatedRange();

  const handleReserve = async () => {
    setReserveError(null);
    setSubmitting(true);
    try {
      requestId.current ??= crypto.randomUUID();
      const res = await fetch(`/api/intake?session=${encodeURIComponent(sessionId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ requestId: requestId.current, trailerNumber, carrierName, driverName, driverPhone, serviceType, eta }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.job) {
        const holdDate = data.job.expiresAt ? new Date(data.job.expiresAt) : new Date(Date.now() + 45 * 60000);
        const holdTime = holdDate.toLocaleTimeString([], {
          timeZone: "America/Denver",
          hour: "2-digit",
          minute: "2-digit",
        });

        const bay = data.job.bayNumber || "Bay 2";
        setAssignedBay(bay);
        setConfirmedReservation({
          id: data.job.id,
          bayNumber: bay,
          holdUntil: holdTime,
          eta: data.job.eta,
          createdAt: data.job.createdAt,
        });
        setReserveError(null);
      } else {
        setReserveError(data.error || "Unable to reserve dock bay. Please check inputs and retry.");
      }
    } catch (err) {
      console.error("Reservation failed:", err);
      setReserveError("Network connection error. Please verify cellular connection and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-100 flex flex-col font-sans pb-12">
      
      {/* Top Header */}
      <header className="bg-[#0b192c] border-b border-[#233f63] sticky top-0 z-30 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#d4af37] text-[#0b192c] font-black flex items-center justify-center text-sm">
            DE
          </div>
          <div>
            <span className="font-bold text-sm text-white">Denver Express Warehousing</span>
            <p className="text-[10px] text-slate-400">Emergency Cross-Dock & Rework Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={sessionId ? `/maps?session=${encodeURIComponent(sessionId)}` : "/maps"}
            className="text-[11px] bg-blue-600/20 text-blue-300 px-2 py-1 rounded border border-blue-500/40 flex items-center gap-1 hover:bg-blue-600/30 transition"
          >
            <MapPin className="w-3 h-3 text-blue-400" />
            <span className="hidden xs:inline">From</span> Maps
          </Link>
          <Link
            href={sessionId ? `/office?session=${encodeURIComponent(sessionId)}` : "/office"}
            className="text-[11px] bg-[#162b45] text-slate-300 px-2 py-1 rounded border border-[#233f63] flex items-center gap-1 hover:bg-[#1f3857] transition"
          >
            <span>Board</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">

        {confirmedReservation ? (
          /* ============================================================== */
          /* SUCCESS CONFIRMATION VOUCHER                                   */
          /* ============================================================== */
          <div className="bg-[#0f2238] border-2 border-emerald-500/60 rounded-2xl p-6 text-center space-y-5 shadow-2xl my-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/40 font-bold tracking-wider">
                CONFIRMED DOCK RESERVATION
              </span>
              <h2 className="text-2xl font-black text-white pt-1">
                {confirmedReservation.bayNumber} Held for {trailerNumber}
              </h2>
              <p className="text-xs text-slate-300">
                Reservation <strong className="text-[#d4af37] font-mono font-bold">#{confirmedReservation.id}</strong> • {carrierName}
              </p>
            </div>

            {/* Critical Directions Box */}
            <div className="bg-[#060d17] border border-[#233f63] rounded-xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-200">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">6030 Washington St, Suite 130, Denver, CO 80216</strong>
                  <span className="text-slate-400 text-[11px]">Direct access from I-25 Exit 215 or I-70 Washington St</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#233f63]/60 text-slate-300">
                <span>Arrival ETA:</span>
                <span className="text-emerald-400 font-bold"><ArrivalEta eta={confirmedReservation.eta} createdAt={confirmedReservation.createdAt} /></span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Bay Held Until:</span>
                <span className="text-white font-mono font-bold">{confirmedReservation.holdUntil} MT</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Illustrative Rework Cost:</span>
                <span className="text-[#d4af37] font-mono font-bold">${range.low} – ${range.high}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Gate Instructions:</span>
                <span className="text-slate-300">Demo allocation: {confirmedReservation.bayNumber}. Confirm arrival instructions with the office.</span>
              </div>
            </div>

            {/* Map Action Button */}
            <div className="space-y-2 pt-2">
              <a
                href="https://maps.google.com/?q=6030+Washington+St+Denver+CO"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0b192c] font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Start Navigation to 6030 Washington St</span>
              </a>

              <Link
                href={sessionId ? `/dock?session=${encodeURIComponent(sessionId)}` : "/dock"}
                className="w-full py-3 rounded-xl bg-[#162b45] hover:bg-[#233f63] text-slate-200 border border-[#233f63] font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Switch to Forklift View to Check-In This Truck →</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* PRE-ARRIVAL RESERVATION FORM                                   */
          /* ============================================================== */
          <div className="bg-[#0f2238] border border-[#233f63] rounded-2xl p-5 space-y-5 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider mb-2">
                <Clock className="w-3 h-3" />
                <span>Daily Cutoff: 3:30 PM MT</span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                Reserve Emergency Rework Bay
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Try a fictional driver request and watch it arrive at the office and dock.
              </p>
            </div>

            {/* Issue Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                Select Cargo Problem *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setServiceType("Shifted Pallets")}
                  className={`p-3 rounded-xl text-left border-2 transition ${
                    serviceType === "Shifted Pallets"
                      ? "border-[#d4af37] bg-[#d4af37]/15 text-white"
                      : "border-[#233f63] bg-[#162b45] text-slate-300"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-[#d4af37] mb-1" />
                  <div className="text-xs font-bold">Shifted Cargo</div>
                  <div className="text-[10px] text-slate-400">Mountain / tunnel lean</div>
                </button>


                <button
                  type="button"
                  onClick={() => setServiceType("Pallet Swap")}
                  className={`p-3 rounded-xl text-left border-2 transition ${
                    serviceType === "Pallet Swap"
                      ? "border-[#d4af37] bg-[#d4af37]/15 text-white"
                      : "border-[#233f63] bg-[#162b45] text-slate-300"
                  }`}
                >
                  <Layers className="w-4 h-4 text-emerald-400 mb-1" />
                  <div className="text-xs font-bold">Pallet Replacement</div>
                  <div className="text-[10px] text-slate-400">Broken baseboards</div>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType("Floor Transload")}
                  className={`p-3 rounded-xl text-left border-2 transition ${
                    serviceType === "Floor Transload"
                      ? "border-[#d4af37] bg-[#d4af37]/15 text-white"
                      : "border-[#233f63] bg-[#162b45] text-slate-300"
                  }`}
                >
                  <Container className="w-4 h-4 text-purple-400 mb-1" />
                  <div className="text-xs font-bold">Floor Transload</div>
                  <div className="text-[10px] text-slate-400">Container breakdown</div>
                </button>
              </div>
            </div>

            {/* Pallet Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="uppercase text-slate-300 tracking-wider">Affected Pallet Count</span>
                <span className="font-mono text-[#d4af37] text-sm font-black">{palletCount} Pallets</span>
              </div>
              <input
                type="range"
                min="1"
                max="26"
                value={palletCount}
                onChange={(e) => setPalletCount(parseInt(e.target.value))}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>1 pallet</span>
                <span>13 (half trailer)</span>
                <span>26 (full load)</span>
              </div>
            </div>

            {/* Trailer & Carrier */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Trailer Number *
                </label>
                <input
                  type="text"
                  value={trailerNumber}
                  onChange={(e) => setTrailerNumber(e.target.value.toUpperCase())}
                  className="w-full bg-[#060d17] border border-[#233f63] rounded-xl px-3 py-2.5 text-white font-mono font-bold text-sm focus:border-[#d4af37] outline-none"
                  placeholder="e.g. SWFT-55219"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Carrier Name
                </label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full bg-[#060d17] border border-[#233f63] rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#d4af37] outline-none"
                  placeholder="Carrier name"
                />
              </div>
            </div>

            {/* Phone & ETA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Driver Mobile Phone *
                </label>
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full bg-[#060d17] border border-[#233f63] rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:border-[#d4af37] outline-none"
                  placeholder="(xxx) xxx-xxxx"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Your ETA to Washington St *
                </label>
                <select
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  className="w-full bg-[#060d17] border border-[#233f63] rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#d4af37] outline-none"
                >
                  <option value="15-20 Mins">Within 20 Mins (Commerce City)</option>
                  <option value="30 Mins">Within 30 Mins (Denver Metro)</option>
                  <option value="45-60 Mins">Within 1 Hour (Mountain Descent)</option>
                  <option value="Before 3:30 PM">Before 3:30 PM Cutoff</option>
                </select>
              </div>
            </div>

            {/* Instant Estimate Box */}
            <div className="bg-[#060d17] border border-[#d4af37]/40 rounded-xl p-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Estimated Rework Range:
                </span>
                <span className="text-2xl font-black text-[#d4af37] font-mono">
                  ${range.low} – ${range.high}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Illustrative pricing only. Actual scope, charges and bay availability require office confirmation.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Demo bay allocation is confirmed after submission.</span>
              </div>
            </div>

            {/* Reserve Error Banner */}
            {reserveError && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-white">Reservation Request Failed</span>
                  <span className="text-[11px]">{reserveError}</span>
                </div>
                <button
                  type="button"
                  onClick={handleReserve}
                  className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0 transition"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleReserve}
              className="w-full py-4 rounded-xl bg-[#d4af37] hover:bg-[#b89628] text-[#0b192c] font-black text-base transition shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>RESERVING BAY...</span>
              ) : (
                <>
                  <span>SUBMIT DEMO REQUEST</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400">
              Denver Express Warehousing & Cross-Docking • 6030 Washington St, Denver, CO • (303) 289-4343
            </p>
          </div>
        )}

      </main>
    </div>
  );
}


