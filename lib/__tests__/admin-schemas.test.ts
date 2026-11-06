import { describe, it, expect } from "vitest";
import { priceRuleSchema, usedCarSchema, variantPriceSchema } from "../admin-schemas";

const validRule = {
  ruleId: "1",
  roadTaxPct: "9",
  insurance: "39840",
  accessories: "25000",
  otherCharges: "15000",
  validUntil: "2026-12-31",
};

describe("priceRuleSchema", () => {
  it("accepts valid form values", () => {
    expect(priceRuleSchema.safeParse(validRule).success).toBe(true);
  });

  it("rejects a blank road tax instead of treating it as zero", () => {
    expect(priceRuleSchema.safeParse({ ...validRule, roadTaxPct: "" }).success).toBe(false);
  });

  it("rejects road tax above 30 percent", () => {
    expect(priceRuleSchema.safeParse({ ...validRule, roadTaxPct: "45" }).success).toBe(false);
  });

  it("rejects negative amounts", () => {
    expect(priceRuleSchema.safeParse({ ...validRule, insurance: "-5" }).success).toBe(false);
  });

  it("rejects an invalid date", () => {
    expect(priceRuleSchema.safeParse({ ...validRule, validUntil: "2026-13-45" }).success).toBe(false);
    expect(priceRuleSchema.safeParse({ ...validRule, validUntil: "31-12-2026" }).success).toBe(false);
  });
});

describe("variantPriceSchema", () => {
  it("rejects an unrealistically low price", () => {
    expect(variantPriceSchema.safeParse({ variantId: "1", exShowroomPrice: "5000" }).success).toBe(false);
    expect(variantPriceSchema.safeParse({ variantId: "1", exShowroomPrice: "1245000" }).success).toBe(true);
  });
});

describe("usedCarSchema", () => {
  it("only allows the three known statuses", () => {
    expect(usedCarSchema.safeParse({ carId: "1", price: "845000", status: "DELETED" }).success).toBe(false);
    expect(usedCarSchema.safeParse({ carId: "1", price: "845000", status: "SOLD" }).success).toBe(true);
  });
});