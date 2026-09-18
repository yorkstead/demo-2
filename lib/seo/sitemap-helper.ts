import type { MetadataRoute } from "next";
import { ReworkClientConfig, getClientPublicServices } from "../client-config";
import { getCanonicalUrl } from "./structured-data";

/**
 * Generate sitemap entries for a verified client.
 *
 * Guardrails:
 * - If client has noIndex: true (e.g. Denver Express prototypes on Yorkstead domain),
 *   returns empty array to strictly prevent prototype URL indexing.
 * - Only includes verified, public services.
 */
export function generateClientSitemapEntries(
  client: ReworkClientConfig
): MetadataRoute.Sitemap {
  // If the client configuration enforces noindex (staging/demo mode), do not emit sitemap entries
  if (client.seo?.noIndex) {
    return [];
  }

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Client Home
  entries.push({
    url: getCanonicalUrl(client, `/${client.id}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
  });

  // Client Public Services
  const publicServices = getClientPublicServices(client);
  for (const service of publicServices) {
    entries.push({
      url: getCanonicalUrl(client, `/${client.id}/${service.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Conversion / intake routes if configured
  if (client.conversion?.intakeRoute) {
    entries.push({
      url: getCanonicalUrl(client, client.conversion.intakeRoute),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
