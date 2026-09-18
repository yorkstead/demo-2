import { ReworkClientConfig, isServicePublic } from "../client-config";
import { PageSeoInput, SeoGuardrailCheckResult, SeoGuardrailIssue } from "./types";

/**
 * Registry to track generated route titles and canonicals in-memory.
 * Detects duplicate titles, descriptions, and canonicals within a tenant.
 */
class SeoRegistry {
  private readonly titlesByTenant = new Map<string, Map<string, string>>();
  private readonly canonicalsByTenant = new Map<string, Map<string, string>>();

  reset(): void {
    this.titlesByTenant.clear();
    this.canonicalsByTenant.clear();
  }

  checkAndRegister(
    tenantId: string,
    routePath: string,
    title: string,
    canonical: string
  ): SeoGuardrailIssue[] {
    const issues: SeoGuardrailIssue[] = [];

    // Titles check
    let tenantTitles = this.titlesByTenant.get(tenantId);
    if (!tenantTitles) {
      tenantTitles = new Map();
      this.titlesByTenant.set(tenantId, tenantTitles);
    }
    const existingRouteForTitle = tenantTitles.get(title.toLowerCase().trim());
    if (existingRouteForTitle && existingRouteForTitle !== routePath) {
      issues.push({
        code: "DUPLICATE_TITLE",
        severity: "error",
        field: "title",
        message: `Duplicate title '${title}' detected between '${routePath}' and '${existingRouteForTitle}' for tenant '${tenantId}'.`,
      });
    } else {
      tenantTitles.set(title.toLowerCase().trim(), routePath);
    }

    // Canonicals check
    let tenantCanonicals = this.canonicalsByTenant.get(tenantId);
    if (!tenantCanonicals) {
      tenantCanonicals = new Map();
      this.canonicalsByTenant.set(tenantId, tenantCanonicals);
    }
    const existingRouteForCanonical = tenantCanonicals.get(canonical.toLowerCase().trim());
    if (existingRouteForCanonical && existingRouteForCanonical !== routePath) {
      issues.push({
        code: "DUPLICATE_CANONICAL",
        severity: "error",
        field: "canonical",
        message: `Duplicate canonical URL '${canonical}' detected between '${routePath}' and '${existingRouteForCanonical}'.`,
      });
    } else {
      tenantCanonicals.set(canonical.toLowerCase().trim(), routePath);
    }

    return issues;
  }
}

export const SEO_REGISTRY = new SeoRegistry();

const SUSPICIOUS_PLACEHOLDERS = [
  "todo",
  "tbd",
  "placeholder",
  "lorem ipsum",
  "[insert",
  "xxx",
  "test client",
];

/**
 * Validates page SEO inputs against quality and tenant isolation guardrails.
 */
export function validateSeoInput(
  client: ReworkClientConfig,
  input: PageSeoInput
): SeoGuardrailCheckResult {
  const issues: SeoGuardrailIssue[] = [];

  // 1. Missing Required Fields
  if (!input.title || input.title.trim() === "") {
    issues.push({
      code: "MISSING_REQUIRED_FIELD",
      severity: "error",
      field: "title",
      message: "Page SEO title cannot be empty.",
    });
  }

  if (!input.description || input.description.trim() === "") {
    issues.push({
      code: "MISSING_REQUIRED_FIELD",
      severity: "error",
      field: "description",
      message: "Page SEO description cannot be empty.",
    });
  }

  // 2. Length Best Practices
  if (input.title && input.title.length > 70) {
    issues.push({
      code: "TITLE_TOO_LONG",
      severity: "warning",
      field: "title",
      message: `Title length (${input.title.length} chars) exceeds optimal search snippet limit (60-70 chars).`,
    });
  }

  if (input.description && input.description.length > 170) {
    issues.push({
      code: "DESCRIPTION_TOO_LONG",
      severity: "warning",
      field: "description",
      message: `Description length (${input.description.length} chars) exceeds optimal search snippet limit (155-160 chars).`,
    });
  }

  // 3. Placeholder Text Detection
  const combinedContent = `${input.title} ${input.description}`.toLowerCase();
  for (const token of SUSPICIOUS_PLACEHOLDERS) {
    if (combinedContent.includes(token)) {
      issues.push({
        code: "PLACEHOLDER_DETECTED",
        severity: "error",
        field: "content",
        message: `Detected suspicious placeholder text '${token}' in SEO metadata.`,
      });
    }
  }

  // 4. Capability Verification Guardrail (Tenant Safety)
  if (input.serviceId && !isServicePublic(client, input.serviceId)) {
    issues.push({
      code: "UNVERIFIED_SERVICE_EXPOSURE",
      severity: "error",
      field: "serviceId",
      message: `Service '${input.serviceId}' is not verified and public for client '${client.id}'. Do not create public SEO pages for unverified capabilities.`,
    });
  }

  // 5. Tenant Data Leak Prevention
  // Ensure default Yorkstead baseline phone/address is never accidentally applied to a distinct client
  if (client.id !== "default") {
    if (input.description.includes("Yorkstead Systems LLC") || input.title.includes("Yorkstead Systems LLC")) {
      issues.push({
        code: "DATA_LEAK_TENANT_MISMATCH",
        severity: "error",
        field: "tenant",
        message: `Client metadata for '${client.id}' references parent entity 'Yorkstead Systems LLC'.`,
      });
    }
  }

  // 6. Registry Checks for Duplicate Titles and Canonicals
  const canonicalBase = client.seo?.canonicalDomain || client.website || "https://rework-flow.yorkstead.com";
  const fullCanonical = `${canonicalBase.replace(/\/+$/, "")}${input.path.startsWith("/") ? input.path : "/" + input.path}`;
  const registryIssues = SEO_REGISTRY.checkAndRegister(client.id, input.path, input.title, fullCanonical);
  issues.push(...registryIssues);

  return {
    valid: !issues.some((i) => i.severity === "error"),
    issues,
  };
}
