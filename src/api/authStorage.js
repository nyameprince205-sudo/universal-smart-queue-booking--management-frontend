const STORAGE_KEY = "queueSaasAuth";
function getAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
function setAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}
function updateAccessToken(newAccessToken) {
  const current = getAuth();
  if (!current) return;
  setAuth({
    ...current,
    accessToken: newAccessToken
  });
}
function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}
export { getAuth, setAuth, updateAccessToken, clearAuth };