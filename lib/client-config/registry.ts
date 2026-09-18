import { ReworkClientConfig } from "./types";
import { DEFAULT_CLIENT_CONFIG } from "./clients/default";
import { DENVER_EXPRESS_CONFIG } from "./clients/denver-express";

/**
 * Multi-Tenant Client Registry
 *
 * Maps client identifiers to immutable client configurations.
 */
const CLIENT_REGISTRY: Readonly<Record<string, ReworkClientConfig>> = {
  default: DEFAULT_CLIENT_CONFIG,
  "denver-express": DENVER_EXPRESS_CONFIG,
};

/**
 * Hostname to Client ID Mapping for future custom domain support.
 * (e.g. 'rework.denverexpressco.com' -> 'denver-express')
 */
const HOSTNAME_MAP: Readonly<Record<string, string>> = {
  "denverexpressco.com": "denver-express",
  "rework.denverexpressco.com": "denver-express",
  "denver-express.rework-flow.yorkstead.com": "denver-express",
};

/**
 * Retrieve a client configuration by explicit identifier.
 * Falls back safely to DEFAULT_CLIENT_CONFIG if not found.
 */
export function getClientConfig(clientId?: string | null): ReworkClientConfig {
  if (!clientId) return DEFAULT_CLIENT_CONFIG;
  return CLIENT_REGISTRY[clientId] || DEFAULT_CLIENT_CONFIG;
}

/**
 * Route-based client resolution.
 * Detects client identifier from pathname (e.g. '/denver-express/...' -> 'denver-express').
 * Falls back to default when visiting standard routes (/dock, /office, /reserve).
 */
export function resolveClientFromPath(pathname?: string | null): ReworkClientConfig {
  if (!pathname) return DEFAULT_CLIENT_CONFIG;

  const normalized = pathname.toLowerCase();
  if (normalized.startsWith("/denver-express/") || normalized === "/denver-express") {
    return DENVER_EXPRESS_CONFIG;
  }

  return DEFAULT_CLIENT_CONFIG;
}

/**
 * Host/Subdomain-based client resolution.
 * Designed so custom domain deployments can resolve the client without changing consumers.
 */
export function resolveClientFromHost(hostname?: string | null): ReworkClientConfig {
  if (!hostname) return DEFAULT_CLIENT_CONFIG;

  const cleanHost = hostname.toLowerCase().split(":")[0];
  const matchedId = HOSTNAME_MAP[cleanHost];
  if (matchedId && CLIENT_REGISTRY[matchedId]) {
    return CLIENT_REGISTRY[matchedId];
  }

  return DEFAULT_CLIENT_CONFIG;
}

/**
 * Comprehensive client resolver supporting route, host, or explicit client query/header.
 */
export function resolveClient(context: {
  pathname?: string | null;
  hostname?: string | null;
  clientId?: string | null;
}): ReworkClientConfig {
  if (context.clientId) {
    return getClientConfig(context.clientId);
  }
  if (context.pathname) {
    const fromPath = resolveClientFromPath(context.pathname);
    if (fromPath.id !== "default") return fromPath;
  }
  if (context.hostname) {
    const fromHost = resolveClientFromHost(context.hostname);
    if (fromHost.id !== "default") return fromHost;
  }
  return DEFAULT_CLIENT_CONFIG;
}

/**
 * List all registered client IDs.
 */
export function getRegisteredClientIds(): readonly string[] {
  return Object.keys(CLIENT_REGISTRY);
}
