import { z } from "zod";

// A blank field must be rejected, not silently turned into zero
const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const wholeRupees = (min: number, max: number) =>
  z.preprocess(blankToUndefined, z.coerce.number().int().min(min).max(max));

export const variantPriceSchema = z.object({
  variantId: z.coerce.number().int().positive(),
  exShowroomPrice: wholeRupees(100_000, 100_000_000),
});

export const priceRuleSchema = z.object({
  ruleId: z.coerce.number().int().positive(),
  roadTaxPct: z.preprocess(blankToUndefined, z.coerce.number().min(0).max(30)),
  insurance: wholeRupees(0, 100_000_000),
  accessories: wholeRupees(0, 100_000_000),
  otherCharges: wholeRupees(0, 100_000_000),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((s) => !Number.isNaN(Date.parse(s))),
});

export const usedCarSchema = z.object({
  carId: z.coerce.number().int().positive(),
  price: wholeRupees(50_000, 100_000_000),
  status: z.enum(["AVAILABLE", "BOOKED", "SOLD"]),
});