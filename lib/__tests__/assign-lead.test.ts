import { describe, it, expect } from "vitest";
import { pickConsultant } from "../assign-lead";

const rules = [
  { showroomId: 1, carModelId: 10, consultantId: 100 },
  { showroomId: 1, carModelId: 11, consultantId: 101 },
  { showroomId: 2, carModelId: null, consultantId: 200 },
];

describe("pickConsultant", () => {
  it("uses the model-specific rule first", () => {
    expect(pickConsultant(rules, 1, 11)).toBe(101);
  });

  it("falls back to the showroom-wide rule", () => {
    expect(pickConsultant(rules, 2, 10)).toBe(200);
  });

  it("returns null when nobody is responsible", () => {
    expect(pickConsultant(rules, 1, 12)).toBeNull();
    expect(pickConsultant(rules, 3, 10)).toBeNull();
  });

  it("handles a lead with no known model", () => {
    expect(pickConsultant(rules, 2, null)).toBe(200);
    expect(pickConsultant(rules, 1, null)).toBeNull();
  });
});