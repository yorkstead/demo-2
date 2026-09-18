import { z } from "zod";

export const rescueServices = [
  "freight-rework",
  "cross-docking",
  "transloading",
  "rejected-load-recovery",
  "shifted-load-recovery",
  "pallet-restacking",
  "repalletizing",
  "short-term-staging",
  "shrink-wrapping",
  "freight-weighing",
] as const;
export const rescueProblems = [
  "Receiver rejected load",
  "Shifted pallets",
  "Broken pallet",
  "Needs restacking",
  "Needs repalletizing",
  "Needs rewrap",
  "Freight weight check",
  "Missed delivery",
  "Needs cross-dock",
  "Needs transloading",
  "Needs short-term staging",
  "Other freight problem",
] as const;
const text = (max: number) => z.string().trim().max(max).default("");
// Raster-only data URLs; SVG/HTML and remote URLs are intentionally excluded.
export const PhotoSchema = z
  .string()
  .max(500000)
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/);
export const RescueDetailsSchema = z
  .object({
    contactName: z.string().trim().min(1).max(100),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(30)
      .regex(/^[+\d() .-]+$/)
      .refine(value => value.replace(/\D/g, '').length >= 7, 'Enter a phone number with at least 7 digits'),
    email: z.union([z.literal(""), z.email().max(200)]).default(""),
    company: text(100),
    role: z
      .enum(["driver", "broker", "dispatcher", "shipper", "other"])
      .default("driver"),
    location: text(200),
    trailer: text(30),
    reference: text(100),
    commodity: text(200),
    palletCount: z.number().int().min(0).max(100).optional(),
    problem: z.enum(rescueProblems),
    service: z.enum(rescueServices),
    urgency: z.enum(["urgent", "today", "scheduled"]).default("today"),
    receiverRequirements: text(1000),
    deadline: text(100),
    notes: text(1000),
    photos: z.array(PhotoSchema).max(3).default([]),
  })
  .strict();
export const RescueMetadataSchema = z
  .object({
    version: z.literal(1),
    clientId: z.string().regex(/^[a-z0-9-]{1,40}$/),
    source: z.literal("public-freight-rescue-demo"),
    demo: z.literal(true),
    requestId: z.uuid(),
    submittedAt: z.iso.datetime(),
    details: RescueDetailsSchema,
  })
  .strict();
export const RescueSubmissionSchema = z
  .object({
    requestId: z.uuid(),
    sessionToken: z.uuid(),
    demoAcknowledged: z.literal(true),
    details: RescueDetailsSchema,
  })
  .strict();
export type RescueMetadata = z.infer<typeof RescueMetadataSchema>;
export type RescueDetails = z.infer<typeof RescueDetailsSchema>;
export function rescueSession(clientId: string, token: string) {
  return `rescue-${clientId}-${token}`;
}
