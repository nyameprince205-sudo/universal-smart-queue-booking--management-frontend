import { createContext, useContext, useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";
import { getAuth, setAuth, clearAuth } from "../api/authStorage";
const AuthContext = createContext(null);
function AuthProvider({
  children
}) {
  const [loading, setLoading] = useState(true);
  const [authType, setAuthType] = useState(null);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const existing = getAuth();
    if (existing) {
      setAuthType(existing.authType);
      setProfile(existing.profile);
    }
    setLoading(false);
    function handleForcedLogout() {
      setAuthType(null);
      setProfile(null);
    }
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);
  const loginStaff = useCallback(async (email, password) => {
    const {
      data
    } = await apiClient.post("/auth/login", {
      email,
      password
    });
    setAuth({
      authType: "staff",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profile: data.user
    });
    setAuthType("staff");
    setProfile(data.user);
    return data.user;
  }, []);
  const loginCustomer = useCallback(async (phone, password) => {
    const {
      data
    } = await apiClient.post("/customers/login", {
      phone,
      password
    });
    setAuth({
      authType: "customer",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profile: data.customer
    });
    setAuthType("customer");
    setProfile(data.customer);
    return data.customer;
  }, []);
  const registerCustomer = useCallback(async (name, phone, email, password) => {
    const {
      data
    } = await apiClient.post("/customers/register", {
      name,
      phone,
      email,
      password
    });
    setAuth({
      authType: "customer",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profile: data.customer
    });
    setAuthType("customer");
    setProfile(data.customer);
    return data.customer;
  }, []);
  const logout = useCallback(() => {
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
    logout
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}
export { AuthProvider, useAuth };