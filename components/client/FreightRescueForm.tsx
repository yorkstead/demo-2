"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { ReworkClientConfig } from "@/lib/client-config";
import { getServiceById, isServicePublic } from "@/lib/client-config/services";
import { rescueProblems, rescueServices } from "@/lib/freight-rescue/schema";

const field =
  "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] focus:outline-none";
type Photo = { name: string; data: string };
async function preparePhoto(file: File): Promise<Photo> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Use JPEG, PNG or WebP images under 10 MB each.");
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Photo preparation unavailable.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.72);
    if (data.length > 500000)
      throw new Error("Photo is too detailed. Choose a smaller image.");
    return { name: file.name, data };
  } finally {
    bitmap.close();
  }
}
export function FreightRescueForm({
  client,
  basePath,
  initialService,
  sessionToken,
}: {
  client: ReworkClientConfig;
  basePath: string;
  initialService?: string;
  sessionToken?: string;
}) {
  const services = rescueServices.filter((service) =>
    isServicePublic(client, service),
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{
    jobId: string;
    sessionId: string;
    token: string;
  } | null>(null);
  const requestId = useRef("");
  const session = useRef(sessionToken || "");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || processingPhotos) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    requestId.current ||= crypto.randomUUID();
    session.current ||= crypto.randomUUID();
    const details = Object.fromEntries(
      [
        "contactName",
        "phone",
        "email",
        "company",
        "role",
        "location",
        "trailer",
        "reference",
        "commodity",
        "problem",
        "service",
        "urgency",
        "receiverRequirements",
        "deadline",
        "notes",
      ].map((name) => [name, String(form.get(name) || "")]),
    );
    try {
      const response = await fetch(`${basePath}/api/rescue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          sessionToken: session.current,
          demoAcknowledged: form.get("demoAcknowledged") === "on",
          details: {
            ...details,
            ...(form.get("palletCount")
              ? { palletCount: Number(form.get("palletCount")) }
              : {}),
            photos: photos.map((photo) => photo.data),
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed.");
      setReceipt({ ...result, token: session.current });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to save. Retry when connected.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <section
        className="space-y-5 rounded-2xl border border-emerald-300 bg-emerald-50/50 p-6 shadow-sm text-slate-800"
        role="status"
      >
        <h2 className="text-2xl font-bold text-emerald-950">Demo handoff saved</h2>
        <p className="font-mono text-sm font-semibold text-emerald-800">Reference: {receipt.jobId}</p>
        <p className="text-slate-600">
          This created a simulated reservation in Rework Flow. It does not
          reserve a real dock, confirm a price or notify {client.businessName}.
          The baseline dock and office screens contain sample rates and
          operational assumptions.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            className="rounded-xl bg-[#0b192c] hover:bg-[#162b45] px-4 py-3 font-bold text-white shadow-sm transition-colors"
            href={`/dock?session=${encodeURIComponent(receipt.sessionId)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open dock demo ↗
          </a>
          <a
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-3 font-semibold text-slate-800 shadow-sm transition-colors"
            href={`/office?session=${encodeURIComponent(receipt.sessionId)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open office demo ↗
          </a>
          <Link
            className="px-4 py-3 font-medium text-[#d97706] hover:underline"
            href={`${basePath}/pitch?session=${receipt.token}`}
          >
            View intake &amp; pitch session →
          </Link>
        </div>
        <p className="text-xs text-slate-500">
          Use the same session links on both devices. Keep demo records
          synthetic.
        </p>
        <button
          className="min-h-12 text-sm font-semibold text-slate-700 underline hover:text-slate-900"
          onClick={() => {
            requestId.current = "";
            setReceipt(null);
            setPhotos([]);
          }}
        >
          Create another demo request
        </button>
      </section>
    );
  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-slate-800"
    >
      <fieldset disabled={busy} className="space-y-6">
        <legend className="mb-4 text-xl font-bold text-[#0b192c]">
          Describe the freight need
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            Problem
            <select name="problem" className={field}>
              {rescueProblems.map((problem) => (
                <option key={problem}>{problem}</option>
              ))}
            </select>
          </label>
          <label>
            Requested service
            <select
              name="service"
              defaultValue={
                services.find((service) => service === initialService) ||
                services[0]
              }
              className={field}
            >
              {services.map((service) => (
                <option key={service} value={service}>
                  {getServiceById(service)?.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Contact name *
            <input
              name="contactName"
              required
              maxLength={100}
              autoComplete="off"
              className={field}
            />
          </label>
          <label>
            Phone *
            <input
              name="phone"
              type="tel"
              required
              minLength={7}
              maxLength={30}
              autoComplete="off"
              className={field}
            />
          </label>
          <label>
            Your role
            <select name="role" className={field}>
              {["driver", "broker", "dispatcher", "shipper", "other"].map(
                (role) => (
                  <option key={role}>{role}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Requested timing
            <select name="urgency" className={field}>
              <option value="today">Today</option>
              <option value="urgent">Urgent — call to confirm</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </label>
        </div>
      </fieldset>
      <details className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <summary className="min-h-10 cursor-pointer font-bold text-[#0b192c]">
          Load details (optional)
        </summary>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {[
            ["company", "Company", 100],
            ["email", "Email", 200],
            ["location", "Current location", 200],
            ["trailer", "Trailer number", 30],
            ["reference", "Load / reference number", 100],
            ["commodity", "Commodity", 200],
            [
              "deadline",
              "Appointment / redelivery deadline (include timezone)",
              100,
            ],
          ].map(([name, label, max]) => (
            <label key={name}>
              {label}
              <input
                name={String(name)}
                type={name === "email" ? "email" : "text"}
                maxLength={Number(max)}
                className={field}
              />
            </label>
          ))}
          <label>
            Pallet count
            <input
              name="palletCount"
              type="number"
              min={0}
              max={100}
              className={field}
            />
          </label>
          <label className="sm:col-span-2">
            Receiver requirements
            <textarea
              name="receiverRequirements"
              maxLength={1000}
              className={field}
            />
          </label>
          <label className="sm:col-span-2">
            Notes
            <textarea name="notes" maxLength={1000} className={field} />
          </label>
        </div>
      </details>
      {client.featureFlags.enablePhotoIntake && (
        <section className="space-y-3">
          <label className="block font-bold text-[#0b192c]" htmlFor="rescue-photos">
            Optional photos or redacted paperwork images
          </label>
          <p className="text-sm text-slate-500">
            Up to 3 JPEG, PNG or WebP images. Use synthetic or non-sensitive
            images. Images are resized and saved with the demo job; PDF uploads
            are not supported.
          </p>
          <input
            id="rescue-photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy || processingPhotos}
            className="max-w-full py-2 text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
            onChange={async (event) => {
              const files = Array.from(event.target.files || []);
              event.target.value = "";
              setError("");
              if (photos.length + files.length > 3) {
                setError("Choose no more than 3 photos.");
                return;
              }
              setProcessingPhotos(true);
              try {
                const prepared = await Promise.all(files.map(preparePhoto));
                setPhotos((current) => [...current, ...prepared]);
              } catch (failure) {
                setError(
                  failure instanceof Error
                    ? failure.message
                    : "Photo could not be read.",
                );
              } finally {
                setProcessingPhotos(false);
              }
            }}
          />
          {photos.map((photo, index) => (
            <div
              key={`${photo.name}-${index}`}
              className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
            >
              <span className="break-all text-sm font-medium text-slate-700">{photo.name} · ready</span>
              <button
                type="button"
                disabled={busy}
                className="text-sm text-red-600 hover:underline"
                onClick={() =>
                  setPhotos((current) => current.filter((_, i) => i !== index))
                }
              >
                Remove {index + 1}
              </button>
            </div>
          ))}
        </section>
      )}
      <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
        <input
          name="demoAcknowledged"
          required
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-[#d97706] focus:ring-[#d97706]"
        />
        I am using synthetic demo details. I understand this saves a demo job
        and does not contact dispatch or book real service.
      </label>
      <p className="text-sm text-slate-500">
        This demonstration has session separation, not staff authentication. Do
        not submit personal, customer or confidential freight records. For an
        actual request, call {client.phone}.
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700 text-sm font-medium"
        >
          {error}
        </p>
      )}
      <button
        disabled={busy || processingPhotos}
        className="min-h-12 rounded-xl bg-[#d97706] hover:bg-[#b45309] px-6 py-3 font-bold text-white shadow-sm transition-colors disabled:opacity-50"
      >
        {busy
          ? "Saving demo…"
          : processingPhotos
            ? "Preparing photos…"
            : "Save demo & open workflow"}
      </button>
    </form>
  );
}
