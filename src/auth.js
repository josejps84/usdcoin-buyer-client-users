const TOKEN_KEY = "token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Reads the claims of the stored JWT (for UI decisions only; the backend validates the signature).
 * Returns null when there is no token or it has expired.
 */
export function getSession() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(payload));
    if (claims.exp && claims.exp * 1000 <= Date.now()) {
      clearToken();
      return null;
    }
    return { email: claims.sub, userId: claims.userId, userType: claims.userType, isAdmin: claims.userType === "ADMIN" };
  } catch {
    clearToken();
    return null;
  }
}
