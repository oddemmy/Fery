// Centralizes reading and writing the auth token, so every component
// doesn't need to know it's stored in localStorage specifically.

const TOKEN_KEY = "fery_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Reads the payload out of a JWT without verifying its signature — safe
// to do on the frontend purely for display purposes (e.g. showing the
// user's email), since the real verification already happened on the
// server when the token was issued, and happens again server-side on
// every protected request.
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Convenience: returns the decoded user from the stored token, or null
// if there's no token or it's malformed.
export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
}