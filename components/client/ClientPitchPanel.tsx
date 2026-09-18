"use client";
import { useState } from "react";
import type { ReworkClientConfig } from "@/lib/client-config";
import type { ClientPresentation } from "@/lib/client-config/presentation";
import type { ReworkJob } from "@/lib/types";
import { rescueSession } from "@/lib/freight-rescue/schema";

export function ClientPitchPanel({
  client,
  presentation,
  initialSession,
}: {
  client: ReworkClientConfig;
  presentation: ClientPresentation;
  initialSession?: string;
}) {
  const [token, setToken] = useState(initialSession || "");
  const [jobs, setJobs] = useState<ReworkJob[]>([]);
  const [status, setStatus] = useState("");
  const sessionId = token ? rescueSession(client.id, token) : "";
  function createSession() {
    const next = crypto.randomUUID();
    setToken(next);
    setJobs([]);
    setStatus("New demo session ready.");
    window.history.replaceState(
      null,
      "",
      `${presentation.basePath}/pitch?session=${next}`,
    );
  }
  async function refresh() {
    setStatus("Loading intake records…");
    try {
      const response = await fetch(
        `/api/jobs?session=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error();
      const result = await response.json();
      const records = result.jobs.filter(
        (job: ReworkJob) => job.rescueMetadata?.clientId === client.id,
      );
      setJobs(records);
      setStatus(`${records.length} demo intake record(s).`);
    } catch {
      setStatus("Could not load this demo session. Please retry.");
    }
  }
  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-800">
      <h2 className="text-2xl font-bold text-[#0b192c]">Run the live demonstration</h2>
      <p className="text-slate-600 leading-relaxed">
        Use synthetic details. The existing operational screens include sample
        pricing, bay holds and seeded records. These are product demonstrations,
        not approved client operating policies.
      </p>
      <button
        className="min-h-12 rounded-xl bg-[#d97706] hover:bg-[#b45309] px-5 font-bold text-white shadow-sm transition-colors"
        onClick={createSession}
      >
        {token ? "Start a fresh demo session" : "Create demo session"}
      </button>
      {token && (
        <>
          <ol className="list-decimal space-y-4 pl-5 text-slate-700">
            <li>
              <a
                className="inline-block py-1 font-semibold text-[#d97706] hover:underline"
                href={`${presentation.basePath}/freight-rescue?session=${token}`}
              >
                Open Freight Rescue
              </a>{" "}
              — choose a need, add synthetic contact details and an optional
              photo.
            </li>
            <li>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  className="inline-block py-1 font-semibold text-[#0b192c] hover:underline"
                  target="_blank"
                  rel="noreferrer"
                  href={`/dock?session=${encodeURIComponent(sessionId)}`}
                >
                  Open dock screen ↗
                </a>
                <span className="text-slate-400 text-xs">or</span>
                <a
                  className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#d4af37]/15 text-[#b45309] font-bold text-xs border border-[#d4af37]/40 hover:bg-[#d4af37]/25 transition"
                  target="_blank"
                  rel="noreferrer"
                  href={`/dock?session=${encodeURIComponent(sessionId)}&frame=active5&orientation=landscape`}
                  title="Open dock in Samsung Galaxy Tab Active5 Landscape (Forklift RAM Dock)"
                >
                  <span>🖥️ Active5 Landscape (Forklift Dock) ↗</span>
                </a>
                <a
                  className="inline-flex items-center gap-1 py-1 px-2 rounded-lg text-slate-600 font-semibold text-xs border border-slate-200 hover:bg-slate-100 transition"
                  target="_blank"
                  rel="noreferrer"
                  href={`/dock?session=${encodeURIComponent(sessionId)}&frame=active5&orientation=portrait`}
                  title="Open dock in Samsung Galaxy Tab Active5 Portrait (Handheld)"
                >
                  <span>📱 Portrait ↗</span>
                </a>
              </div>
              <span className="text-slate-600 block mt-0.5">
                — check in the demo reservation, capture evidence, tally and sign.
              </span>
            </li>
            <li>
              <a
                className="inline-block py-1 font-semibold text-[#0b192c] hover:underline"
                target="_blank"
                rel="noreferrer"
                href={`/office?session=${encodeURIComponent(sessionId)}`}
              >
                Open office screen ↗
              </a>{" "}
              — observe updates, inspect the certificate and preview accounting
              export.
            </li>
            <li>
              Return here to inspect the original intake context preserved
              through the handoff.
            </li>
          </ol>
          <p className="break-all text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
            Session ID: {sessionId}
          </p>
          <button
            className="min-h-12 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 font-semibold text-slate-800 shadow-sm transition-colors"
            onClick={refresh}
          >
            Refresh intake records
          </button>
        </>
      )}
      <p aria-live="polite" className="text-sm font-medium text-amber-800">
        {status}
      </p>
      {jobs.map((job) => {
        const intake = job.rescueMetadata!;
        return (
          <article
            key={job.id}
            className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
          >
            <h3 className="font-bold text-[#0b192c]">
              {job.id} · <span className="uppercase text-xs tracking-wider font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">{job.status}</span>
            </h3>
            <p className="font-medium text-slate-800">
              {intake.details.problem} / {intake.details.service} /{" "}
              {intake.details.urgency}
            </p>
            <p className="text-sm text-slate-600">
              {intake.details.contactName} · {intake.details.phone}
            </p>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {Object.entries(intake.details)
                .filter(
                  ([key, value]) =>
                    key !== "photos" && value !== "" && value !== undefined,
                )
                .map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-slate-500 text-xs uppercase tracking-wider">{key}</dt>
                    <dd className="break-words font-medium text-slate-800">{String(value)}</dd>
                  </div>
                ))}
            </dl>
            <div className="grid gap-3 sm:grid-cols-3">
              {intake.details.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Original demo intake evidence ${index + 1}`}
                  className="max-h-60 rounded-lg object-contain border border-slate-200"
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Source: {intake.source}. Submitted {intake.submittedAt}. Original
              intake retained separately from later dock evidence.
            </p>
          </article>
        );
      })}
    </section>
  );
}
