import axios from "axios";
import { getAuth, updateAccessToken, clearAuth } from "./authStorage";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  console.error("VITE_API_BASE_URL is not set. Copy .env.example to .env and set it (see README).");
}
const apiClient = axios.create({
  baseURL: API_BASE_URL
});
const rawClient = axios.create({
  baseURL: API_BASE_URL
});
apiClient.interceptors.request.use(config => {
  const auth = getAuth();
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});
const REFRESH_ENDPOINTS = {
  staff: "/auth/refresh",
  customer: "/customers/refresh"
};
let refreshPromise = null;
async function refreshAccessToken(authType, refreshToken) {
  if (!refreshPromise) {
    refreshPromise = rawClient.post(REFRESH_ENDPOINTS[authType], {
      refreshToken
    }).then(response => {
      updateAccessToken(response.data.accessToken);
      return response.data.accessToken;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
apiClient.interceptors.response.use(response => response, async error => {
  const originalRequest = error.config;
  const status = error.response?.status;
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
    clearAuth();
    window.dispatchEvent(new Event("auth:logout"));
    return Promise.reject(refreshError);
  }
});
export default apiClient;