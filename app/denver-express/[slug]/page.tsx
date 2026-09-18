import { notFound } from "next/navigation";
import { DENVER_EXPRESS_CONFIG as client } from "@/lib/client-config";
import { DENVER_EXPRESS_PRESENTATION as presentation } from "@/lib/client-config/clients/denver-express-presentation";
import { publicPages } from "@/lib/client-config/presentation";
import { ServicePage } from "@/components/client/ServicePage";
import { demoMetadata } from "@/lib/seo/demo-metadata";

export const dynamicParams = false;
export function generateStaticParams() {
  return publicPages(client, presentation).map((page) => ({ slug: page.slug }));
}
async function resolve(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const page = publicPages(client, presentation).find(
    (item) => item.slug === slug,
  );
  if (!page) notFound();
  return page;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = await resolve(params);
  return demoMetadata(client, page.title, page.summary);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <ServicePage
      client={client}
      presentation={presentation}
      page={await resolve(params)}
    />
  );
}
