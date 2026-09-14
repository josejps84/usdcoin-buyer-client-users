import { API_BASE } from "./config";

export async function apiFetch(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    //window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  return res;
}
