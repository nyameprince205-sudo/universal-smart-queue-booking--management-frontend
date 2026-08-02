import { createContext, useContext, useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";
import { getAuth, setAuth, clearAuth } from "../api/authStorage";

const AuthContext = createContext(null);

// `authType` is the key idea this whole context exists to manage: a
// SUPER_ADMIN/ORG_ADMIN/STAFF user and a CUSTOMER are fundamentally
// different identities on the backend (different tables, different JWTs,
// different endpoints — see auth.controller.js vs customer.controller.js).
// A component that needs to know "who's logged in right now, and as what
// kind of account" reads this context instead of re-deriving it from raw
// localStorage or a decoded token everywhere it's needed.
function AuthProvider({ children }) {
  // `loading` exists so routes don't flash a "please log in" screen for a
  // split second on every page refresh while we check localStorage — the
  // check is synchronous, but React still needs one render cycle to apply
  // it, and callers (ProtectedRoute, in Step 2) will want to wait for this
  // before deciding what to render.
  const [loading, setLoading] = useState(true);
  const [authType, setAuthType] = useState(null); // "staff" | "customer" | null
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const existing = getAuth();
    if (existing) {
      setAuthType(existing.authType);
      setProfile(existing.profile);
    }
    setLoading(false);

    // client.js dispatches this when a refresh token turns out to be
    // invalid/expired — this is the ONLY way the axios layer can tell React
    // state "you're logged out now," since it has no access to this
    // component's setState calls directly.
    function handleForcedLogout() {
      setAuthType(null);
      setProfile(null);
    }
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  const loginStaff = useCallback(async (email, password) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    setAuth({
      authType: "staff",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profile: data.user,
    });
    setAuthType("staff");
    setProfile(data.user);
    return data.user;
  }, []);

  const loginCustomer = useCallback(async (phone, password) => {
    const { data } = await apiClient.post("/customers/login", { phone, password });
    setAuth({
      authType: "customer",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profile: data.customer,
    });
    setAuthType("customer");
    setProfile(data.customer);
    return data.customer;
  }, []);

  const registerCustomer = useCallback(async (name, phone, email, password) => {
    const { data } = await apiClient.post("/customers/register", { name, phone, email, password });
    setAuth({
      authType: "customer",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profile: data.customer,
    });
    setAuthType("customer");
    setProfile(data.customer);
    return data.customer;
  }, []);

  const logout = useCallback(() => {
    // No server-side call here on purpose — this codebase has no
    // /auth/logout endpoint. Access tokens are short-lived (15 min) and
    // simply expire; clearing local storage is enough to end the session
    // on this device. A real production version might maintain a
    // refresh-token blocklist server-side, but that's beyond this MVP.
    clearAuth();
    setAuthType(null);
    setProfile(null);
  }, []);

  const value = {
    loading,
    authType,
    profile,
    isAuthenticated: authType !== null,
    loginStaff,
    loginCustomer,
    registerCustomer,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Small custom hook so components write `useAuth()` instead of
// `useContext(AuthContext)` everywhere, and get a clear error if someone
// ever tries to use it outside the provider (instead of a confusing
// "cannot read property of null" deep inside their own component).
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}

export { AuthProvider, useAuth };
