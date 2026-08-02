import axios from "axios";
import { getAuth, updateAccessToken, clearAuth } from "./authStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  // Fail loudly at startup rather than quietly sending requests to
  // "undefined/auth/login" — that's a confusing bug to debug later.
  console.error(
    "VITE_API_BASE_URL is not set. Copy .env.example to .env and set it (see README)."
  );
}

const apiClient = axios.create({ baseURL: API_BASE_URL });

// A SEPARATE plain axios instance (no interceptors) used only for the
// refresh-token call itself. If the refresh call went through `apiClient`,
// a 401 on IT would trigger the response interceptor below again —
// refreshing forever in a loop the moment a refresh token also expires.
const rawClient = axios.create({ baseURL: API_BASE_URL });

// ---- Request interceptor: attach whichever token is currently active ----
apiClient.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// The backend has two ENTIRELY separate auth systems (staff/admin users vs
// customers — see auth.controller.js vs customer.controller.js), each with
// its own /refresh endpoint. This is the one place that distinction needs
// to be known when refreshing a token.
const REFRESH_ENDPOINTS = {
  staff: "/auth/refresh",
  customer: "/customers/refresh",
};

// If two requests both get a 401 at roughly the same moment (e.g. a page
// that fires several API calls on load), we don't want to fire the refresh
// endpoint twice — the second refresh could race the first, or waste a
// call. This variable holds the IN-PROGRESS refresh promise so a second
// request can just wait on the same one instead of starting its own.
let refreshPromise = null;

async function refreshAccessToken(authType, refreshToken) {
  if (!refreshPromise) {
    refreshPromise = rawClient
      .post(REFRESH_ENDPOINTS[authType], { refreshToken })
      .then((response) => {
        updateAccessToken(response.data.accessToken);
        return response.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ---- Response interceptor: on a 401, try ONE silent refresh-and-retry ----
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // `_retried` is a flag we stamp onto the request ourselves (see below).
    // Without it, a request that fails AGAIN after a successful refresh
    // (e.g. because the user's account was deactivated, not because the
    // token expired) would retry forever instead of surfacing the error.
    if (status !== 401 || originalRequest._retried) {
      return Promise.reject(error);
    }

    const auth = getAuth();
    if (!auth?.refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    try {
      const newAccessToken = await refreshAccessToken(auth.authType, auth.refreshToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // The refresh token itself is invalid/expired — there's no path back
      // to a valid session short of logging in again. Clear storage and
      // tell the rest of the app (AuthContext is listening for this) so the
      // UI can redirect to login immediately, instead of the user staring
      // at a broken page until they happen to navigate somewhere new.
      clearAuth();
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
