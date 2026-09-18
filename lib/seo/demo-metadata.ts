import type { ReworkClientConfig } from "../client-config/types";
import { buildPageMetadata } from "./metadata";

/** Demo pages never declare an unapproved production URL or become indexable. */
export function demoMetadata(
  client: ReworkClientConfig,
  title: string,
  description: string,
) {
  const metadata = buildPageMetadata(client, {
    path: `/${client.id}`,
    title: `${title} | Yorkstead demo`,
    description,
    noIndex: true,
  });
  return {
    ...metadata,
    alternates: { canonical: null },
    openGraph: { ...metadata.openGraph, url: undefined },
    twitter: { ...metadata.twitter, card: "summary" as const },
  };
}
