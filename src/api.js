import { API_BASE } from "./config";
import { clearToken, getToken } from "./auth";

export class SessionExpiredError extends Error {
  constructor() {
    super("Tu sesión expiró. Inicia sesión de nuevo.");
    this.name = "SessionExpiredError";
  }
}

export async function apiFetch(method, path, body = null) {
  const headers = {};
  const token = getToken();

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== null) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== null ? JSON.stringify(body) : undefined,
  });

  // A 401 only means "session expired" when we actually sent a token (login failures are also 401)
  if (res.status === 401 && token) {
    clearToken();
    throw new SessionExpiredError();
  }

  return res;
}

/** Extracts the message of an error response (RFC 9457 ProblemDetail or plain text). */
export async function errorMessage(res, fallback) {
  try {
    const text = await res.text();
    if (!text) return fallback;
    try {
      const data = JSON.parse(text);
      return data.detail || data.message || fallback;
    } catch {
      return text;
    }
  } catch {
    return fallback;
  }
}
