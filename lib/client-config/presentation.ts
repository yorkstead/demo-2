import type { ReworkClientConfig, StandardServiceId } from "./types";
import { isServicePublic } from "./services";

export interface ServicePageContent {
  slug: string;
  serviceId: StandardServiceId;
  title: string;
  summary: string;
  problem: string;
  approach: string;
  prepare: readonly string[];
  cta: string;
  related: readonly string[];
}
export interface ClientPresentation {
  clientId: string;
  basePath: string;
  headline: string;
  introduction: string;
  pages: readonly ServicePageContent[];
  opportunity: readonly string[];
  productionRequirements: readonly string[];
}
export function publicPages(
  client: ReworkClientConfig,
  presentation: ClientPresentation,
) {
  if (client.id !== presentation.clientId)
    throw new Error("Client presentation mismatch");
  return presentation.pages.filter((page) =>
    isServicePublic(client, page.serviceId),
  );
}
