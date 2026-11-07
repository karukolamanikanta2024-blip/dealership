import { describe, it, expect } from "vitest";
import { priceRuleSchema, usedCarSchema, variantPriceSchema, newUsedCarSchema } from "../admin-schemas";

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

const validCar = {
  stockId: "uc-1300",
  modelName: "Model H",
  variantName: "ZX",
  fuel: "PETROL",
  transmission: "AUTOMATIC",
  year: "2023",
  kmDriven: "20000",
  owners: "1",
  registrationMasked: "UP32 ** ****",
  colour: "Silver",
  price: "950000",
  inspectionScore: "90",
  inspectionNotes: "Clean car, one owner.",
  showroomId: "1",
};

describe("newUsedCarSchema", () => {
  it("accepts a valid car and upper-cases the stock ID", () => {
    const r = newUsedCarSchema.safeParse(validCar);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.stockId).toBe("UC-1300");
  });

  it("rejects a registration number that is not masked", () => {
    expect(newUsedCarSchema.safeParse({ ...validCar, registrationMasked: "UP32 AB 1234" }).success).toBe(false);
  });

  it("rejects a blank price instead of treating it as zero", () => {
    expect(newUsedCarSchema.safeParse({ ...validCar, price: "" }).success).toBe(false);
  });

  it("rejects an unrealistic year or number of owners", () => {
    expect(newUsedCarSchema.safeParse({ ...validCar, year: "1990" }).success).toBe(false);
    expect(newUsedCarSchema.safeParse({ ...validCar, owners: "0" }).success).toBe(false);
  });

  it("rejects an unknown fuel type", () => {
    expect(newUsedCarSchema.safeParse({ ...validCar, fuel: "STEAM" }).success).toBe(false);
  });
});