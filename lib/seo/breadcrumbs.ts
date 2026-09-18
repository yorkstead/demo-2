import { ReworkClientConfig, StandardServiceId, getServiceById } from "../client-config";
import { BreadcrumbItem } from "./types";

/**
 * Builds breadcrumb navigation trails for client service and landing pages.
 */
export function buildClientBreadcrumbs(
  client: ReworkClientConfig,
  currentPage: { name: string; path: string },
  serviceId?: StandardServiceId
): readonly BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: client.businessName,
      path: `/${client.id}`,
    },
  ];

  if (serviceId) {
    const serviceDef = getServiceById(serviceId);
    if (serviceDef && currentPage.name !== serviceDef.name) {
      trail.push({
        name: serviceDef.name,
        path: `/${client.id}/${serviceDef.slug}`,
      });
    }
  }

  trail.push(currentPage);

  return trail;
}
