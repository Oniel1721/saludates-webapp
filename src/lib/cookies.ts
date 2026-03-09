import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { z } from "zod";

export const TOKEN_KEY = "saludates_token";
export const CLINIC_ID_KEY = "saludates_clinic_id";

const payloadSchema = z.object({
  sub: z.email(),
  role: z.enum(["CLINIC_USER", "SUPERADMIN"]),
  clinicId: z.string().optional().nullable(),
});

export function getServerClinicId(cookies: ReadonlyRequestCookies) {
  return cookies.get(CLINIC_ID_KEY)?.value ?? null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

export function getServerPayload(cookies: ReadonlyRequestCookies) {
  const token = cookies.get(TOKEN_KEY)?.value;
  if (!token) return null;
  const rawPayload = decodeJwtPayload(token);
  if (!rawPayload) return null;
  const parsedPayload = payloadSchema.safeParse(rawPayload);
  if (!parsedPayload.success) return null;
  return parsedPayload.data;
}
