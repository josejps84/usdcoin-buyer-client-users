import { describe, expect, it } from "vitest";
import { clearToken, getSession, getToken, saveToken } from "./auth";
import { makeToken } from "./test/helpers";

describe("auth", () => {
  it("stores and clears the token", () => {
    saveToken("abc");
    expect(getToken()).toBe("abc");
    clearToken();
    expect(getToken()).toBeNull();
  });

  it("returns no session without a token", () => {
    expect(getSession()).toBeNull();
  });

  it("decodes the claims of a valid token", () => {
    saveToken(makeToken({ sub: "admin@example.com", userId: 1, userType: "ADMIN" }));
    expect(getSession()).toEqual({ email: "admin@example.com", userId: 1, userType: "ADMIN", isAdmin: true });
  });

  it("customers are not admins", () => {
    saveToken(makeToken());
    expect(getSession().isAdmin).toBe(false);
  });

  it("drops an expired token", () => {
    saveToken(makeToken({ exp: Math.floor(Date.now() / 1000) - 10 }));
    expect(getSession()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("drops a malformed token", () => {
    saveToken("not-a-jwt");
    expect(getSession()).toBeNull();
    expect(getToken()).toBeNull();
  });
});
