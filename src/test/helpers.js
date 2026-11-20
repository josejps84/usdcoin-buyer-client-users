import { vi } from "vitest";

const base64Url = (value) =>
  btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Builds an (unsigned) JWT with the given claims; the client only decodes it. */
export function makeToken(claims = {}) {
  const payload = {
    sub: "jane@example.com",
    userId: 7,
    userType: "CUSTOMER",
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...claims,
  };
  return `${base64Url({ alg: "HS256" })}.${base64Url(payload)}.signature`;
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Replaces global fetch with a mock that answers with the given responses in order. */
export function mockFetch(...responses) {
  const fetchMock = vi.fn();
  responses.forEach((response) => fetchMock.mockResolvedValueOnce(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
