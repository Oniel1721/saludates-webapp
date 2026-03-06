import { z } from "zod";

/** 1500 → "RD$1,500" */
export function formatPrice(amount: number): string {
  return `RD$${amount.toLocaleString("es-DO")}`;
}

/** "RD$1,500" or "1500" → 1500 */
export function parsePrice(input: string): number {
  return Number(input.replace(/\D/g, ""));
}

export const priceSchema = z
  .string()
  .min(1, "Este campo es requerido.")
  .regex(/^\d+$/, "Ingresa un número válido.")
  .transform((val) => Number(val));
