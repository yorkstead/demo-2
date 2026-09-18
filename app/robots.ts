import type { MetadataRoute } from "next";

/**
 * Next.js Robots Exclusion Protocol Handler
 *
 * Directives:
 * - Allows indexing of baseline Yorkstead Rework Flow public pages (/ and /reserve)
 * - Strictly disallows indexing of /denver-express/ prototype pages on the Yorkstead domain
 *   to avoid accidental domain collision and preserve canonical ownership for denverexpressco.com
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rework-flow.yorkstead.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/reserve", "/commercial", "/maps"],
        disallow: ["/denver-express", "/dock", "/office", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
