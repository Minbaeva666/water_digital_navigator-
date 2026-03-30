import { describe, expect, it } from "vitest";
import { buildImageUrl, buildPublicImageUrl } from "./imageUrlHelper";

describe("imageUrlHelper", () => {
  it("returns undefined for empty values", () => {
    expect(buildImageUrl(undefined)).toBeUndefined();
    expect(buildImageUrl(null)).toBeUndefined();
    expect(buildPublicImageUrl("")).toBeUndefined();
  });

  it("keeps absolute and data urls untouched", () => {
    expect(buildImageUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
    expect(buildImageUrl("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
  });

  it("prepends backend url for relative paths", () => {
    expect(buildImageUrl("uploads/a.png")).toMatch(/\/uploads\/a\.png$/);
    expect(buildImageUrl("/uploads/a.png")).toMatch(/\/uploads\/a\.png$/);
  });

  it("builds public image url under configured folder", () => {
    expect(buildPublicImageUrl("logo.png")).toMatch(
      /\/public\/assets\/digital-solution-images\/logo\.png$/
    );
  });
});
