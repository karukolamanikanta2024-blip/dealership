import { describe, it, expect } from "vitest";
import { responseState } from "../response-timer";

const created = new Date("2026-11-03T10:00:00Z");
const at = (min: number) => new Date(created.getTime() + min * 60000);

describe("responseState", () => {
  it("shows time left while the lead is waiting", () => {
    expect(responseState({ createdAt: created, firstResponseAt: null }, at(2))).toEqual({ kind: "due", minutes: 3 });
  });

  it("is overdue after 5 minutes", () => {
    expect(responseState({ createdAt: created, firstResponseAt: null }, at(12))).toEqual({ kind: "overdue", minutes: 7 });
  });

  it("counts a reply within 5 minutes as on time", () => {
    expect(responseState({ createdAt: created, firstResponseAt: at(4) }, at(60))).toEqual({ kind: "responded", minutes: 4 });
  });

  it("counts a reply after 5 minutes as late", () => {
    expect(responseState({ createdAt: created, firstResponseAt: at(9) }, at(60))).toEqual({ kind: "responded-late", minutes: 9 });
  });

  it("treats exactly 5 minutes as on time", () => {
    expect(responseState({ createdAt: created, firstResponseAt: at(5) }, at(60)).kind).toBe("responded");
  });
});