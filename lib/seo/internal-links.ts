import {
  StandardServiceId,
  ReworkClientConfig,
  LocationCorridorContext,
  isServicePublic,
} from "../client-config";
import { InternalLinkMetadata } from "./types";

/**
 * Canonical Service Cross-Link Graph
 * Connects operational services to complementary recovery and transfer workflows.
 */
export const SERVICE_CROSS_LINKS: Readonly<Record<StandardServiceId, readonly StandardServiceId[]>> = {
  "freight-rework": ["pallet-restacking", "repalletizing", "load-stabilization", "cross-docking"],
  "cross-docking": ["transloading", "short-term-staging", "freight-rework"],
  "transloading": ["cross-docking", "short-term-staging", "freight-rework"],
  "pallet-restacking": ["repalletizing", "shrink-wrapping", "load-stabilization"],
  "repalletizing": ["pallet-restacking", "shrink-wrapping", "freight-weighing"],
  "load-stabilization": ["shrink-wrapping", "pallet-restacking", "shifted-load-recovery"],
  "rejected-load-recovery": ["freight-rework", "repalletizing", "short-term-staging"],
  "shifted-load-recovery": ["pallet-restacking", "load-stabilization", "repalletizing"],
  "shrink-wrapping": ["load-stabilization", "pallet-restacking", "repalletizing"],
  "freight-weighing": ["repalletizing", "cross-docking", "freight-rework"],
  "short-term-staging": ["cross-docking", "rejected-load-recovery", "transloading"],
  "trailer-transfer": ["cross-docking", "transloading"],
  "pallet-transfer": ["repalletizing", "pallet-restacking"],
};

export interface GetRelatedLinksOptions {
  readonly serviceId: StandardServiceId;
  readonly client?: ReworkClientConfig;
  readonly locationContext?: LocationCorridorContext;
  readonly basePath?: string;
}

/**
 * Reusable, configuration-driven internal cross-link generator.
 *
 * Consumes client and location context dynamically from configuration rather than
 * embedding hardcoded client geography into the SEO module.
 */
export function getRelatedLinks(options: GetRelatedLinksOptions): readonly InternalLinkMetadata[] {
  const { serviceId, client, locationContext, basePath } = options;
  const related = SERVICE_CROSS_LINKS[serviceId] || [];
  const base = basePath || (client ? `/${client.id}` : "");
  const loc = locationContext || client?.locationContext;
  const areaName = loc?.marketArea ? loc.marketArea.split(",")[0].trim() : "";
  const areaSuffix = areaName ? ` in ${areaName}` : "";

  return related
    .filter((relId) => !client || isServicePublic(client, relId))
    .map((relId) => {
      const title = relId
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        title,
        href: `${base}/${relId}`,
        anchorText: `${title}${areaSuffix}`,
        serviceId: relId,
      };
    });
}

/**
 * Backward-compatible helper for retrieving cross links.
 */
export function getRecommendedCrossLinks(
  serviceId: StandardServiceId,
  client?: ReworkClientConfig,
  basePath?: string
): readonly InternalLinkMetadata[] {
  return getRelatedLinks({ serviceId, client, basePath });
}
