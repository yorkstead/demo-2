"use client";

import React from "react";
import { Truck, AlertTriangle, Layers, Container, ArrowRight } from "lucide-react";
import { ReworkJob } from "@/lib/types";
import { ArrivalEta } from "@/components/arrival-eta";

interface DockIntakeStepProps {
  incomingReservations: ReworkJob[];
  handleCheckInReserved: (job: ReworkJob) => void;
  serviceType: ReworkJob["serviceType"];
  setServiceType: (service: ReworkJob["serviceType"]) => void;
  trailerNumber: string;
  setTrailerNumber: (t: string) => void;
  carrierName: string;
  setCarrierName: (c: string) => void;
  bayNumber: string;
  setBayNumber: (b: string) => void;
  driverName: string;
  setDriverName: (d: string) => void;
  driverPhone: string;
  setDriverPhone: (p: string) => void;
  cycleSample: () => void;
  onContinue: () => void;
  isLandscape?: boolean;
}

export function DockIntakeStep({
  incomingReservations,
  handleCheckInReserved,
  serviceType,
  setServiceType,
  trailerNumber,
  setTrailerNumber,
  carrierName,
  setCarrierName,
  bayNumber,
  setBayNumber,
  driverName,
  setDriverName,
  driverPhone,
  setDriverPhone,
  cycleSample,
  onContinue,
  isLandscape = false,
}: DockIntakeStepProps) {
  return (
    <div
      className={`bg-[#0f2238] border border-[#233f63] rounded-2xl shadow-xl ${
        isLandscape ? "p-3 sm:p-4 space-y-3" : "p-4 sm:p-5 space-y-4"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
            Step 1: Rapid Inbound Intake
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Assign bay and select damage recovery</p>
        </div>
        {isLandscape && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
            Forklift Mount View
          </span>
        )}
      </div>

      {/* Main Form Content: Split 2-column on landscape, stacked on portrait */}
      <div className={isLandscape ? "grid grid-cols-12 gap-3.5 items-start" : "space-y-4"}>
        {/* Left Column in Landscape: Inbound Holds + Service Types */}
        <div className={isLandscape ? "col-span-5 space-y-2.5" : "space-y-3"}>
          {/* INCOMING PRE-ARRIVAL RESERVATIONS BANNER */}
          {incomingReservations.length > 0 && (
            <div className="bg-amber-500/15 border-2 border-amber-500/60 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  Incoming Reserved ({incomingReservations.length})
                </span>
                <span className="text-[9px] uppercase font-mono bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/30">
                  Hold
                </span>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {incomingReservations.map((res) => (
                  <div
                    key={res.id}
                    className="bg-[#060d17] p-2 rounded-lg border border-[#233f63] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white font-mono truncate">
                        {res.trailerNumber} <span className="text-slate-400 font-normal">({res.carrierName})</span>
                        {res.phoneIntake && <p className="mt-1 whitespace-pre-wrap break-words text-xs font-normal text-slate-300">Phone request · {res.driverName} · {res.driverPhone}{res.phoneIntake.notes ? `\n${res.phoneIntake.notes}` : ""}</p>}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {res.bayNumber} • <strong className="text-emerald-400"><ArrivalEta eta={res.eta} createdAt={res.createdAt} /></strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCheckInReserved(res)}
                      className="px-2.5 py-1 rounded-md bg-[#d4af37] hover:bg-[#b89628] text-[#0b192c] font-black text-xs shrink-0 transition cursor-pointer"
                    >
                      In →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Type Selection */}
          <div>
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Select Rework Type *
            </label>
            <div className={isLandscape ? "flex flex-col gap-1.5" : "grid grid-cols-2 sm:grid-cols-3 gap-2.5"}>
              <button
                type="button"
                onClick={() => setServiceType("Shifted Pallets")}
                className={`text-left border-2 transition rounded-xl cursor-pointer ${
                  isLandscape ? "p-2 sm:p-2.5 flex items-center gap-2.5" : "p-3 sm:p-4"
                } ${
                  serviceType === "Shifted Pallets"
                    ? "border-[#d4af37] bg-[#d4af37]/15 text-white shadow-md shadow-[#d4af37]/10"
                    : "border-[#233f63] bg-[#162b45] text-slate-300 hover:border-slate-500"
                }`}
              >
                <AlertTriangle className={`text-[#d4af37] shrink-0 ${isLandscape ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 mb-1.5"}`} />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold truncate">Shifted Pallets</div>
                  <div className="text-[10px] text-slate-400 truncate">Mountain / tunnel lean</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceType("Pallet Swap")}
                className={`text-left border-2 transition rounded-xl cursor-pointer ${
                  isLandscape ? "p-2 sm:p-2.5 flex items-center gap-2.5" : "p-3 sm:p-4"
                } ${
                  serviceType === "Pallet Swap"
                    ? "border-[#d4af37] bg-[#d4af37]/15 text-white shadow-md shadow-[#d4af37]/10"
                    : "border-[#233f63] bg-[#162b45] text-slate-300 hover:border-slate-500"
                }`}
              >
                <Layers className={`text-emerald-400 shrink-0 ${isLandscape ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 mb-1.5"}`} />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold truncate">Pallet Swap</div>
                  <div className="text-[10px] text-slate-400 truncate">Crushed / broken wood</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceType("Floor Transload")}
                className={`text-left border-2 transition rounded-xl cursor-pointer ${
                  isLandscape ? "p-2 sm:p-2.5 flex items-center gap-2.5" : "p-3 sm:p-4"
                } ${
                  serviceType === "Floor Transload"
                    ? "border-[#d4af37] bg-[#d4af37]/15 text-white shadow-md shadow-[#d4af37]/10"
                    : "border-[#233f63] bg-[#162b45] text-slate-300 hover:border-slate-500"
                }`}
              >
                <Container className={`text-purple-400 shrink-0 ${isLandscape ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 mb-1.5"}`} />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold truncate">Floor Transload</div>
                  <div className="text-[10px] text-slate-400 truncate">Container breakdown</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column in Landscape: Form Inputs + Action Button */}
        <div className={isLandscape ? "col-span-7 space-y-2.5" : "space-y-3 sm:space-y-4"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
                  Trailer Number *
                </label>
                <button
                  type="button"
                  onClick={cycleSample}
                  className="text-[10px] sm:text-xs text-[#d4af37] hover:underline cursor-pointer"
                >
                  Sample ⟳
                </button>
              </div>
              <input
                type="text"
                value={trailerNumber}
                onChange={(e) => setTrailerNumber(e.target.value.toUpperCase())}
                className="w-full bg-[#060d17] border border-[#233f63] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm sm:text-base focus:border-[#d4af37] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Carrier Name
              </label>
              <input
                type="text"
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                className="w-full bg-[#060d17] border border-[#233f63] rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:border-[#d4af37] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Assigned Bay *
              </label>
              <select
                value={bayNumber}
                onChange={(e) => setBayNumber(e.target.value)}
                className="w-full bg-[#060d17] border border-[#233f63] rounded-xl px-2 py-2 text-white text-xs sm:text-sm focus:border-[#d4af37] outline-none"
              >
                <option value="Bay 1">Bay 1</option>
                <option value="Bay 2">Bay 2</option>
                <option value="Bay 3">Bay 3</option>
                <option value="Bay 4">Bay 4</option>
                <option value="Bay 5">Bay 5</option>
                <option value="Bay 6">Bay 6</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-[#060d17] border border-[#233f63] rounded-xl px-2.5 py-2 text-white text-xs sm:text-sm focus:border-[#d4af37] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Driver Mobile
              </label>
              <input
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full bg-[#060d17] border border-[#233f63] rounded-xl px-2.5 py-2 text-white font-mono text-xs sm:text-sm focus:border-[#d4af37] outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className={`w-full rounded-xl bg-[#d4af37] hover:bg-[#b89628] active:scale-[0.99] text-[#0b192c] font-black transition shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2 cursor-pointer ${
              isLandscape ? "py-2.5 sm:py-3 text-sm sm:text-base mt-2" : "py-4 sm:py-5 text-base sm:text-lg mt-3"
            }`}
          >
            <span>Continue to Before Photos</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
