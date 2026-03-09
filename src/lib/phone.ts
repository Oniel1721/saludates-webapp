import { z } from "zod";

const DR_AREA_CODES = ["809", "829", "849"];

/** "18091234567" → "+1 (809) 123-4567" */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 11) return raw;
  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
}

/** "+1 (809) 123-4567" → "+18091234567" */
export function parsePhone(input: string): string {
  return "+" + input.replace(/\D/g, "");
}

export function isValidDRPhone(raw: string): boolean {
  return new RegExp(`^\\+1(${DR_AREA_CODES.join("|")})\\d{7}$`).test(raw);
}

export const drPhoneSchema = z
  .string()
  .min(1, "Este campo es requerido.")
  .transform((val) => parsePhone(val))
  .refine((val) => isValidDRPhone(val), {
    message: "Ingresa un número dominicano válido (+1 809, 829 o 849).",
  });
