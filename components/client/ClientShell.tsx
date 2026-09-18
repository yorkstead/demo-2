import Link from "next/link";
import type { ReworkClientConfig } from "@/lib/client-config";
import type { ClientPresentation } from "@/lib/client-config/presentation";

export const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
export const action =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[#d97706] hover:bg-[#b45309] px-5 py-3 font-bold text-white shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d97706]";
export const secondary =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50 transition-colors";

export function ClientActions({
  client,
  presentation,
  service,
  label = "Start Freight Rescue",
}: {
  client: ReworkClientConfig;
  presentation: ClientPresentation;
  service?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        className={action}
        href={`${presentation.basePath}/freight-rescue${service ? `?service=${encodeURIComponent(service)}` : ""}`}
      >
        {label}
      </Link>
      {client.phone && (
        <a
          className={secondary}
          href={`tel:${client.phone.replace(/[^+\d]/g, "")}`}
        >
          Call {client.phone}
        </a>
      )}
    </div>
  );
}
export function ClientShell({
  client,
  presentation,
  children,
}: {
  client: ReworkClientConfig;
  presentation: ClientPresentation;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <a
        href="#client-content"
        className="sr-only focus:not-sr-only focus:block focus:p-4 focus:bg-white focus:text-slate-900"
      >
        Skip to content
      </a>
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900">
        Denver Express client demo · For real freight help, call {client.phone}. Demo
        forms do not contact dispatch.
      </div>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav
          aria-label="Client navigation"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3.5"
        >
          <Link href={presentation.basePath} className="flex items-center gap-2 text-lg font-black text-[#0b192c]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b192c] text-sm font-bold text-amber-400">
              DE
            </span>
            <span>
              {client.businessName}{" "}
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full ml-1">
                Portal Demo
              </span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-700">
            <Link className="hover:text-[#d97706] transition-colors py-2" href={`${presentation.basePath}#services`}>
              Services
            </Link>
            <Link
              className="hover:text-[#d97706] transition-colors py-2"
              href={`${presentation.basePath}/freight-rescue`}
            >
              Freight Rescue
            </Link>
            <Link
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0b192c] hover:bg-slate-200 transition-colors"
              href={`${presentation.basePath}/pitch`}
            >
              Pitch Mode
            </Link>
            {client.phone && (
              <a
                href={`tel:${client.phone.replace(/[^+\d]/g, "")}`}
                className="hidden sm:inline-flex items-center gap-1.5 font-bold text-[#0b192c] hover:text-[#d97706]"
              >
                <span>📞</span> {client.phone}
              </a>
            )}
          </div>
        </nav>
      </header>
      <main
        id="client-content"
        className="mx-auto max-w-6xl space-y-10 px-5 py-10 pb-20"
      >
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-[#0b192c] px-5 py-12 text-sm text-slate-400">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-amber-500 text-xs font-black text-[#0b192c]">
                DE
              </span>
              <p className="font-bold text-white text-base">
                {client.legalName || client.businessName}
              </p>
            </div>
            {client.address && (
              <p className="text-slate-300">
                {[
                  client.address.street,
                  client.address.suite,
                  client.address.city,
                  client.address.state,
                  client.address.zip,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            <p className="mt-2 text-slate-300">{client.operations?.operatingHours}</p>
            <p className="text-slate-400 text-xs mt-1">{client.operations?.afterHoursDescription}</p>
          </div>
          <div className="space-y-3 sm:text-right">
            <p className="text-slate-300 font-medium">Availability, scope and pricing require direct confirmation.</p>
            <div className="flex flex-wrap gap-4 sm:justify-end text-xs">
              <a
                href={client.website}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline"
              >
                Official Website (denverexpressco.com)
              </a>
              <Link href={`${presentation.basePath}/proof`} className="hover:text-white transition-colors">
                Reviews &amp; case evidence
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                Rework Flow App
              </Link>
            </div>
            <p className="text-xs text-slate-500 pt-3">
              Website designed by SpinFlow · Integrated Rework Flow demo portal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
