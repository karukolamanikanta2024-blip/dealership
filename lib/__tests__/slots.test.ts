import { describe, it, expect } from "vitest";
import { generateSlots, isValidSlot } from "../slots";

// Tuesday 3 Nov 2026, 10:30 IST
const now = new Date("2026-11-03T05:00:00Z");

describe("generateSlots", () => {
  it("starts at least 2 hours from now", () => {
    const slots = generateSlots(now);
    expect(slots[0].toISOString()).toBe("2026-11-03T07:30:00.000Z"); // 13:00 IST
    expect(slots.every((s) => s.getTime() >= now.getTime() + 2 * 60 * 60 * 1000)).toBe(true);
  });

  it("only offers on-the-hour slots in IST", () => {
    const slots = generateSlots(now);
    expect(slots.every((s) => s.getUTCMinutes() === 30)).toBe(true);
  });

  it("skips Sundays", () => {
    const slots = generateSlots(now); // Sunday is 8 Nov 2026
    const sunday = slots.filter((s) => {
      const ist = new Date(s.getTime() + 330 * 60 * 1000);
      return ist.getUTCDate() === 8;
    });
    expect(sunday).toHaveLength(0);
  });

  it("offers 8 slots on a full day", () => {
    const slots = generateSlots(now);
    const wed = slots.filter((s) => {
      const ist = new Date(s.getTime() + 330 * 60 * 1000);
      return ist.getUTCDate() === 4;
    });
    expect(wed).toHaveLength(8);
  });
});

describe("isValidSlot", () => {
  it("accepts a generated slot", () => {
    expect(isValidSlot(new Date("2026-11-03T07:30:00Z"), now)).toBe(true);
  });

  it("rejects a time that is not on a slot boundary", () => {
    expect(isValidSlot(new Date("2026-11-03T07:45:00Z"), now)).toBe(false);
  });

  it("rejects slots in the past", () => {
    expect(isValidSlot(new Date("2026-11-03T04:30:00Z"), now)).toBe(false);
  });

  it("rejects Sunday slots", () => {
    expect(isValidSlot(new Date("2026-11-08T05:30:00Z"), now)).toBe(false);
  });
});