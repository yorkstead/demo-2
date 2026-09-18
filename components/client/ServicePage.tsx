import Link from "next/link";
import type { ReworkClientConfig } from "@/lib/client-config";
import {
  publicPages,
  type ClientPresentation,
  type ServicePageContent,
} from "@/lib/client-config/presentation";
import { ClientActions, card } from "./ClientShell";

export function ServicePage({
  client,
  presentation,
  page,
}: {
  client: ReworkClientConfig;
  presentation: ClientPresentation;
  page: ServicePageContent;
}) {
  const related = publicPages(client, presentation).filter((item) =>
    page.related.includes(item.slug),
  );
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm font-medium text-slate-500">
        <Link href={presentation.basePath} className="hover:text-[#d97706] transition-colors">
          {client.businessName}
        </Link>{" "}
        / <span aria-current="page" className="text-slate-800 font-semibold">{page.title}</span>
      </nav>
      <section className="max-w-3xl space-y-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[#d97706] bg-amber-100/70 inline-block px-2.5 py-1 rounded-md">
          Freight help / Service preview
        </p>
        <h1 className="text-4xl font-black tracking-tight text-[#0b192c] sm:text-5xl">
          {page.title}
        </h1>
        <p className="text-xl leading-relaxed text-slate-600">{page.summary}</p>
        <ClientActions
          client={client}
          presentation={presentation}
          service={page.serviceId}
          label={page.cta}
        />
      </section>
      <div className="grid gap-5 md:grid-cols-2">
        <section className={card}>
          <h2 className="mb-3 text-xl font-bold text-[#0b192c]">When this fits</h2>
          <p className="leading-relaxed text-slate-600">{page.problem}</p>
          <h2 className="mb-3 mt-6 text-xl font-bold text-[#0b192c]">
            What to discuss with the team
          </h2>
          <p className="leading-relaxed text-slate-600">{page.approach}</p>
        </section>
        <section className={card}>
          <h2 className="mb-4 text-xl font-bold text-[#0b192c]">Have these details ready</h2>
          <ul className="list-disc space-y-3 pl-5 text-slate-600">
            {page.prepare.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Timing and acceptance depend on the actual load and receiving
            availability. Call before arrival.
          </p>
        </section>
      </div>
      <section className={card}>
        <h2 className="mb-3 text-xl font-bold text-[#0b192c]">Location &amp; receiving</h2>
        <p className="text-slate-800 font-medium">
          {client.address?.street}, {client.address?.city},{" "}
          {client.address?.state}
        </p>
        <p className="mt-2 text-slate-600">
          Receiving Hours: {client.operations?.operatingHours}
        </p>
        <p className="mt-1 text-slate-600">{client.operations?.facilityType}</p>
        {client.locationContext && (
          <p className="mt-3 text-sm text-slate-500">
            Serving {client.locationContext.marketArea}. Confirm the truck
            approach and receiving instructions directly before travel.
          </p>
        )}
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-black text-[#0b192c]">Related freight needs</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`${presentation.basePath}/${item.slug}`}
              className={`${card} group hover:border-[#d97706] hover:shadow-md transition-all`}
            >
              <h3 className="font-bold text-[#0b192c] group-hover:text-[#d97706] transition-colors">
                {item.title} →
              </h3>
              <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
