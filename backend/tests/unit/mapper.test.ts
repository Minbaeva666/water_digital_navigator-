import { describe, expect, it } from "vitest";
import { toSet } from "../../src/utils/mapper";

describe("toSet", () => {
  it("returns undefined when input is undefined", () => {
    expect(toSet(undefined)).toBeUndefined();
  });

  it("maps a single id into prisma set format", () => {
    expect(toSet("abc")).toEqual({ set: [{ id: "abc" }] });
  });

  it("deduplicates and removes falsy values", () => {
    expect(toSet(["a", "b", "a", "", "c"])).toEqual({
      set: [{ id: "a" }, { id: "b" }, { id: "c" }],
    });
  });

  it("returns empty set for empty string", () => {
    expect(toSet("")).toEqual({ set: [] });
  });
});
