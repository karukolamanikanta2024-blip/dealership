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

const upper = (v: unknown) => (typeof v === "string" ? v.trim().toUpperCase() : v);
const thisYear = new Date().getFullYear();

export const newUsedCarSchema = z.object({
  stockId: z.preprocess(upper, z.string().regex(/^[A-Z]{2}-\d{3,6}$/)),
  modelName: z.string().trim().min(2).max(40),
  variantName: z.string().trim().min(1).max(40),
  fuel: z.enum(["PETROL", "DIESEL", "CNG", "ELECTRIC"]),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]),
  year: wholeRupees(2005, thisYear + 1),
  kmDriven: wholeRupees(0, 500_000),
  owners: wholeRupees(1, 6),
  // Only a masked number is accepted, so a full registration number can never be stored
  registrationMasked: z.preprocess(upper, z.string().regex(/^[A-Z]{2}\d{2} \*{2} \*{4}$/)),
  colour: z.string().trim().min(2).max(30),
  price: wholeRupees(50_000, 100_000_000),
  inspectionScore: wholeRupees(0, 100),
  inspectionNotes: z.string().trim().min(5).max(300),
  showroomId: z.coerce.number().int().positive(),
});