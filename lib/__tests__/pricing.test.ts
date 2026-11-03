import { describe, it, expect } from "vitest";
import { calculateOnRoadPrice, formatRupees } from "../pricing";

const base = {
  exShowroomPrice: 1245000,
  roadTaxPct: 9,
  insurance: 39840,
  accessories: 25000,
  otherCharges: 15000,
  validUntil: new Date("2026-12-31"),
};

describe("calculateOnRoadPrice", () => {
  it("adds up the full breakup", () => {
    const r = calculateOnRoadPrice(base, new Date("2026-11-03"));
    expect(r.roadTax).toBe(112050);
    expect(r.total).toBe(1245000 + 112050 + 39840 + 25000 + 15000);
    expect(r.expired).toBe(false);
  });

  it("rounds road tax to whole rupees", () => {
    const r = calculateOnRoadPrice({ ...base, exShowroomPrice: 999999, roadTaxPct: 8.5 });
    expect(Number.isInteger(r.roadTax)).toBe(true);
    expect(r.roadTax).toBe(85000);
  });

  it("marks expired prices", () => {
    const r = calculateOnRoadPrice(base, new Date("2027-01-02"));
    expect(r.expired).toBe(true);
  });

  it("rejects negative or invalid inputs", () => {
    expect(() => calculateOnRoadPrice({ ...base, insurance: -1 })).toThrow();
    expect(() => calculateOnRoadPrice({ ...base, roadTaxPct: NaN })).toThrow();
  });
});

describe("formatRupees", () => {
  it("uses Indian digit grouping", () => {
    expect(formatRupees(1245000)).toBe("₹12,45,000");
  });
});