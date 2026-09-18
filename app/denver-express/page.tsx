import Link from "next/link";
import { DENVER_EXPRESS_CONFIG as client } from "@/lib/client-config";
import { DENVER_EXPRESS_PRESENTATION as presentation } from "@/lib/client-config/clients/denver-express-presentation";
import { publicPages } from "@/lib/client-config/presentation";
import { ClientActions, card } from "@/components/client/ClientShell";
import { demoMetadata } from "@/lib/seo/demo-metadata";

export const metadata = demoMetadata(
  client,
  "Freight recovery & cross-docking preview",
  presentation.introduction,
);
export default function Page() {
  const pages = publicPages(client, presentation);
  return (
    <>
      <section className="max-w-4xl space-y-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#d97706] bg-amber-100/70 inline-block px-2.5 py-1 rounded-md">
          A clearer path from freight problem to next step
        </p>
        <h1 className="text-4xl font-black leading-tight tracking-tight text-[#0b192c] sm:text-5xl lg:text-6xl">
          {presentation.headline}
        </h1>
        <p className="max-w-3xl text-xl leading-relaxed text-slate-600">
          {presentation.introduction}
        </p>
        <ClientActions client={client} presentation={presentation} />
        <p className="text-sm font-medium text-slate-500">
          Receiving Hours: {client.operations?.operatingHours}
        </p>
      </section>
      <section id="services">
        <h2 className="mb-5 text-2xl font-black text-[#0b192c]">
          What does your freight need?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.slug}
              className={`${card} group hover:border-[#d97706] hover:shadow-md transition-all`}
              href={`${presentation.basePath}/${page.slug}`}
            >
              <h3 className="text-xl font-bold text-[#0b192c] group-hover:text-[#d97706] transition-colors">
                {page.title} →
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                {page.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className={`${card} grid gap-6 md:grid-cols-3 bg-slate-50 border-slate-200`}>
        {[
          "Identify the freight problem",
          "Share the load details",
          "Confirm the next step",
        ].map((title, index) => (
          <div key={title}>
            <p className="text-sm font-bold font-mono text-[#d97706]">0{index + 1}</p>
            <h2 className="my-2 text-lg font-bold text-[#0b192c]">{title}</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {
                [
                  "Choose the service or describe the issue in Freight Rescue.",
                  "Prepare the receiver instructions, timing and available photos.",
                  "For actual freight, call the team to confirm suitability and availability.",
                ][index]
              }
            </p>
          </div>
        ))}
      </section>
    </>
  );
}
