import { createHash, timingSafeEqual } from "node:crypto";

// Anonymous mode is an explicit deployment choice; never infer it from missing secrets.
export function isDemoMode() {
  return (
    process.env.REWORK_MODE === "demo" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.REWORK_MODE !== "operations")
  );
}

export function workspaceId(request: Request): string {
  if (!isDemoMode()) return process.env.REWORK_WORKSPACE_ID || "operations";
  const value =
    new URL(request.url).searchParams.get("session") ||
    request.headers.get("x-session-id") ||
    "demo-main";
  return value.trim().slice(0, 160) || "demo-main";
}

export function requireStaff(request: Request): Response | null {
  if (isDemoMode()) return null;
  const secret = process.env.REWORK_STAFF_PASSWORD;
  const username = process.env.REWORK_STAFF_USERNAME;
  if (!username || !secret || secret.length < 32) {
    return Response.json(
      { error: "Staff access has not been configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const header = request.headers.get("authorization") || "";
  const expected = Buffer.from(`${username}:${secret}`).toString("base64");
  const hash = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(hash(header), hash(`Basic ${expected}`))) {
    return Response.json(
      { error: "Staff sign-in required." },
      {
        status: 401,
        headers: {
          "WWW-Authenticate":
            'Basic realm="Denver Express Staff", charset="UTF-8"',
          "Cache-Control": "no-store",
        },
      },
    );
  }
  return null;
}

export function requireSameOrigin(request: Request): Response | null {
  if (isDemoMode()) return null;
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json(
      { error: "Same-origin submission required." },
      { status: 403 },
    );
  }
  return null;
}
