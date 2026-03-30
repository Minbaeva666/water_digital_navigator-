import { describe, expect, it } from "vitest";
import {
  generateRevokeToken,
  generateVerificationToken,
  getTokenExpiration,
} from "../../src/utils/auth";

describe("auth utils", () => {
  it("generates 64-char hex verification token", () => {
    const token = generateVerificationToken();

    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("generates unique revoke tokens", () => {
    const tokenA = generateRevokeToken();
    const tokenB = generateRevokeToken();

    expect(tokenA).not.toBe(tokenB);
  });

  it("computes expiration with default and custom hours", () => {
    const now = Date.now();

    const defaultExp = getTokenExpiration();
    const customExp = getTokenExpiration(1);

    expect(defaultExp.getTime()).toBeGreaterThanOrEqual(now + 48 * 60 * 60 * 1000 - 50);
    expect(customExp.getTime()).toBeGreaterThanOrEqual(now + 60 * 60 * 1000 - 50);
  });
});
