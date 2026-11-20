import { describe, expect, it } from "vitest";
import { apiFetch, errorMessage, SessionExpiredError } from "./api";
import { getToken, saveToken } from "./auth";
import { API_BASE } from "./config";
import { jsonResponse, mockFetch } from "./test/helpers";

describe("apiFetch", () => {
  it("sends JSON bodies with the bearer token", async () => {
    saveToken("tkn");
    const fetchMock = mockFetch(jsonResponse({ ok: true }));

    await apiFetch("POST", "/api/x", { a: 1 });

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/api/x`, {
      method: "POST",
      headers: { Authorization: "Bearer tkn", "Content-Type": "application/json" },
      body: '{"a":1}',
    });
  });

  it("sends no body nor content type on GET and no auth header without token", async () => {
    const fetchMock = mockFetch(jsonResponse([]));

    await apiFetch("GET", "/api/x");

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/api/x`, { method: "GET", headers: {}, body: undefined });
  });

  it("a 401 with a token means the session expired", async () => {
    saveToken("expired");
    mockFetch(jsonResponse({}, 401));

    await expect(apiFetch("GET", "/api/accounts")).rejects.toBeInstanceOf(SessionExpiredError);
    expect(getToken()).toBeNull();
  });

  it("a 401 without a token (failed login) is returned to the caller", async () => {
    mockFetch(jsonResponse({ detail: "Credenciales inválidas" }, 401));

    const res = await apiFetch("POST", "/api/users/login", {});

    expect(res.status).toBe(401);
  });
});

describe("errorMessage", () => {
  it("reads the detail of a ProblemDetail", async () => {
    expect(await errorMessage(jsonResponse({ detail: "Saldo insuficiente" }, 400), "x")).toBe("Saldo insuficiente");
  });

  it("falls back to plain text bodies", async () => {
    expect(await errorMessage(new Response("boom", { status: 500 }), "x")).toBe("boom");
  });

  it("uses the fallback for empty bodies or JSON without message", async () => {
    expect(await errorMessage(new Response("", { status: 500 }), "fallback")).toBe("fallback");
    expect(await errorMessage(jsonResponse({ status: 500 }, 500), "fallback")).toBe("fallback");
  });
});
