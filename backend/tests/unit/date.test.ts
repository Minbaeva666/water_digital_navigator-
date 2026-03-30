import { describe, expect, it, vi } from "vitest";
import { parseOrToday } from "../../src/utils/date";

describe("parseOrToday", () => {
  it("parses DD.MM.YYYY format and normalizes to noon", () => {
    const result = parseOrToday("21.03.2026");

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(21);
    expect(result.getHours()).toBe(12);
    expect(result.getMinutes()).toBe(0);
  });

  it("parses ISO date and normalizes to noon", () => {
    const result = parseOrToday("2026-03-22T08:30:00.000Z");

    expect(result.getFullYear()).toBe(2026);
    expect(result.getHours()).toBe(12);
    expect(result.getMinutes()).toBe(0);
  });

  it("falls back to today for invalid input", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T07:00:00.000Z"));

    const result = parseOrToday("invalid");

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(30);
    expect(result.getHours()).toBe(12);

    vi.useRealTimers();
  });
});
