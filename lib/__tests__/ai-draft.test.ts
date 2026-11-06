import { describe, it, expect, vi, afterEach } from "vitest";
import { validateDraft, buildTemplateDraft, generateDraft } from "../ai-draft";

const ctx = {
  name: "Vijay Kumar",
  message: "Is the ZX automatic available this month?",
  source: "WEBSITE",
  car: "Model H ZX Automatic",
  showroom: "Gomti Nagar Showroom",
  consultant: "Aman Verma",
};

const goodJson = JSON.stringify({
  summary: "Vijay wants to know if the Model H ZX Automatic is available this month.",
  reply: "Hello Vijay, thank you for your interest in the Model H. When is a good time for me to call you?",
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("validateDraft", () => {
  it("accepts a clean answer, even inside code fences", () => {
    expect(validateDraft("```json\n" + goodJson + "\n```")).not.toBeNull();
  });

  it("rejects replies that mention discounts or offers", () => {
    const bad = JSON.stringify({ summary: "Buyer wants a car.", reply: "Hello, I can give you a special discount if you visit today." });
    expect(validateDraft(bad)).toBeNull();
  });

  it("rejects replies that quote a price", () => {
    const bad = JSON.stringify({ summary: "Buyer wants a car.", reply: "Hello, the car costs ₹12,45,000 and is ready for delivery." });
    expect(validateDraft(bad)).toBeNull();
  });

  it("rejects text that is not JSON or is too short", () => {
    expect(validateDraft("Sure, here is a reply!")).toBeNull();
    expect(validateDraft(JSON.stringify({ summary: "ok ok ok", reply: "Hi" }))).toBeNull();
  });
});

describe("buildTemplateDraft", () => {
  it("uses the first name, car and consultant", () => {
    const d = buildTemplateDraft(ctx);
    expect(d.source).toBe("template");
    expect(d.reply).toContain("Hello Vijay");
    expect(d.reply).toContain("Model H ZX Automatic");
    expect(d.reply).toContain("Aman Verma");
  });

  it("works with no car and no message", () => {
    const d = buildTemplateDraft({ ...ctx, car: null, message: null, consultant: null });
    expect(d.reply).toContain("your sales consultant");
  });
});

describe("generateDraft", () => {
  it("falls back to the template when there is no API key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const d = await generateDraft(ctx);
    expect(d.source).toBe("template");
  });

  it("uses the AI answer when it is valid", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: [{ type: "text", text: goodJson }] }) }));
    const d = await generateDraft(ctx);
    expect(d.source).toBe("ai");
  });

  it("falls back when the AI promises a discount", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const bad = JSON.stringify({ summary: "Buyer wants a car.", reply: "Hello Vijay, I can offer you a big discount this week. Please call me." });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: [{ type: "text", text: bad }] }) }));
    const d = await generateDraft(ctx);
    expect(d.source).toBe("template");
  });

  it("falls back when the request fails", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const d = await generateDraft(ctx);
    expect(d.source).toBe("template");
  });
});