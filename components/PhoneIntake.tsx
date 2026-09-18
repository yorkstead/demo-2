"use client";

import { useRef, useState, type FormEvent } from "react";
import { Phone } from "lucide-react";
import type { ReworkJob } from "@/lib/types";

export function PhoneIntake({ sessionId, onCreated }: { sessionId: string; onCreated: (job: ReworkJob) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const requestId = useRef<string | null>(null);
  const submitting = useRef(false);
  const inputClass = "mt-1 w-full rounded-lg border border-[#233f63] bg-[#0b192c] px-3 py-2.5 text-white";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const value = (name: string) => String(values.get(name) ?? "").trim();
    if (["driverName", "driverPhone", "carrierName", "trailerNumber"].some(name => !value(name))) {
      setError("Enter the driver, callback number, carrier, and trailer before saving.");
      return;
    }
    if (value("driverPhone").replace(/\D/g, "").length < 10) {
      setError("Enter a callback number with at least 10 digits.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      requestId.current ??= `CALL-${crypto.randomUUID()}`;
      const response = await fetch(`/api/jobs?session=${encodeURIComponent(sessionId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId.current,
          driverName: value("driverName"), driverPhone: value("driverPhone"),
          carrierName: value("carrierName"), trailerNumber: value("trailerNumber"),
          serviceType: value("serviceType"), eta: value("eta"), status: "Reserved",
          phoneIntake: { notes: value("notes") },
          palletsCount: 0, wrapCount: 0, cornersCount: 0, laborHours: 0,
          scaleCheck: false, debrisFee: false, totalAmount: 0,
          estimatedRange: "Pending assessment", beforePhotos: [], afterPhotos: [],
          signatureData: "", defectTags: ["Phone request entered by office"],
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.job) throw new Error(data.error || "Unable to save the phone request.");
      onCreated(data.job);
      setConfirmation(`Phone request saved for ${data.job.driverName} · ${data.job.trailerNumber}. It is now in the dock queue (${data.job.bayNumber}).`);
      requestId.current = null;
      form.reset();
      setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save. Please retry.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return <section className="rounded-2xl border border-[#233f63] bg-[#0f2238] p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-bold text-white">Driver calling in?</h2><p className="text-sm text-slate-400">Enter the request while you talk. The dock picks it up in the same workflow.</p></div>
      <button type="button" aria-expanded={open} aria-controls="phone-intake-form" disabled={busy} onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg bg-[#d4af37] px-4 py-3 font-bold text-[#0b192c]"><Phone size={18} />{open ? "Close phone intake" : "Take a phone request"}</button>
    </div>
    {confirmation && <p role="status" className="mt-3 text-sm text-emerald-300">{confirmation}</p>}
    <form id="phone-intake-form" hidden={!open} onSubmit={submit} className="mt-5">
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
        {([{ name: "driverName", label: "Driver name", max: 100 }, { name: "driverPhone", label: "Callback number", max: 30 }, { name: "carrierName", label: "Carrier / company", max: 100 }, { name: "trailerNumber", label: "Trailer number", max: 30 }] as const).map(field => <label key={field.name} className="text-sm text-slate-300">{field.label}<input name={field.name} required maxLength={field.max} type={field.name === "driverPhone" ? "tel" : "text"} className={inputClass} /></label>)}
        <label className="text-sm text-slate-300">Service needed<select name="serviceType" defaultValue="Freight Rescue" className={inputClass}><option>Freight Rescue</option><option>Shifted Pallets</option><option>Pallet Swap</option><option>Floor Transload</option></select></label>
        <label className="text-sm text-slate-300">Expected arrival<select name="eta" defaultValue="Unknown — confirm with driver" className={inputClass}><option>Unknown — confirm with driver</option><option>15 Mins</option><option>30 Mins</option><option value="60 Mins">1 Hour</option><option value="120 Mins">2 Hours</option></select></label>
        <label className="text-sm text-slate-300 sm:col-span-2">Notes for the dock <span className="text-slate-500">(optional)</span><textarea name="notes" maxLength={1000} rows={3} placeholder="What happened, load details, and any special handling needs" className={inputClass} /></label>
        <p className="text-xs text-slate-400 sm:col-span-2">Photos, actual supplies, and labor are captured at the dock. Pricing is pending assessment. The current demo holds a bay for 45 minutes; confirm availability for later arrivals.</p>
        {error && <p role="alert" className="text-sm text-red-300 sm:col-span-2">{error}</p>}
        <button type="submit" className="rounded-lg bg-white px-4 py-3 font-bold text-slate-950 sm:col-span-2">{busy ? "Saving request…" : "Add to dock queue"}</button>
      </fieldset>
    </form>
  </section>;
}
