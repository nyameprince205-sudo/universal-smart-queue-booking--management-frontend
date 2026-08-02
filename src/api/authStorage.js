// This file is deliberately NOT a React hook or context — it's plain
// localStorage read/write functions that BOTH the axios client (client.js)
// and AuthContext.jsx depend on. Why not just put this logic inside
// AuthContext? Because axios interceptors run completely outside the React
// component tree — by the time a request is being sent or a 401 is being
// handled, there's no "current component" to call useContext() from. Every
// serious React app ends up needing a non-React place tokens live; this
// file is that place, and AuthContext just mirrors it into React state for
// components to read.
//
// STORAGE KEY DESIGN: one single localStorage key holding one JSON blob,
// not three separate keys (accessToken/refreshToken/authType). This matters
// because reading/writing three keys is never atomic — a crash or a bug
// between the three writes could leave you with, say, a customer's
// accessToken paired with a staff refreshToken. One key, one object, one
// write, no possible half-updated state.
const STORAGE_KEY = "queueSaasAuth";

// Shape stored: { authType: "staff" | "customer", accessToken, refreshToken, profile }
// `profile` is whatever the login response gave us about the logged-in
// identity (name, role, organizationId, branchId for staff; name, phone,
// etc. for a customer) — enough for the UI to render "Hi, Kwame" or decide
// which routes to show, without decoding the JWT client-side.

function getAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    // Corrupted value (shouldn't happen, but a browser extension or a
    // manual localStorage edit could do it) — treat as logged out rather
    // than crash the whole app on load.
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function setAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

// Used after a successful token refresh — keeps authType/profile/refreshToken
// as they were, only replaces the accessToken. Written as its own function
// (rather than making every caller reconstruct the whole object) so the
// "what actually changes on refresh" logic lives in exactly one place.
function updateAccessToken(newAccessToken) {
  const current = getAuth();
  if (!current) return;
  setAuth({ ...current, accessToken: newAccessToken });
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export { getAuth, setAuth, updateAccessToken, clearAuth };
