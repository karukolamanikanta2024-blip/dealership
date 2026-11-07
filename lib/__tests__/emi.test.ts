import { describe, it, expect } from "vitest";
import { calculateEmi } from "../emi";

describe("calculateEmi", () => {
  it("matches a known loan (₹10 lakh, 9% a year, 60 months)", () => {
    const r = calculateEmi({ price: 1000000, downPayment: 0, annualRatePct: 9, months: 60 });
    expect(r.emi).toBeGreaterThan(20750);
    expect(r.emi).toBeLessThan(20770);
  });

  it("handles zero interest", () => {
    const r = calculateEmi({ price: 120000, downPayment: 0, annualRatePct: 0, months: 12 });
    expect(r.emi).toBe(10000);
    expect(r.totalInterest).toBe(0);
  });

  it("lends only the amount left after the down payment", () => {
    const r = calculateEmi({ price: 1000000, downPayment: 200000, annualRatePct: 9, months: 60 });
    expect(r.loan).toBe(800000);
  });

  it("total payable is the EMI times the months", () => {
    const r = calculateEmi({ price: 900000, downPayment: 100000, annualRatePct: 10, months: 48 });
    expect(r.totalPayable).toBe(r.emi * 48);
    expect(r.totalInterest).toBe(r.totalPayable - r.loan);
  });

  it("rejects invalid inputs", () => {
    const ok = { price: 1000000, downPayment: 0, annualRatePct: 9, months: 60 };
    expect(() => calculateEmi({ ...ok, downPayment: 2000000 })).toThrow();
    expect(() => calculateEmi({ ...ok, months: 0 })).toThrow();
    expect(() => calculateEmi({ ...ok, annualRatePct: -1 })).toThrow();
    expect(() => calculateEmi({ ...ok, annualRatePct: 50 })).toThrow();
  });
});