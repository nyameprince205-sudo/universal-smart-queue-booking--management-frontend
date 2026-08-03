import { io } from "socket.io-client";

// socket.js on the backend attaches Socket.IO directly to the HTTP server
// with no path prefix — so the connection URL is the API's ORIGIN only
// (e.g. "http://localhost:4000"), not the "/api/v1" REST path. Deriving it
// from the same VITE_API_BASE_URL env var (rather than a second env
// variable) means there's only one place to update if the backend's host
// or port ever changes.
function getSocketOrigin() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
  return apiBaseUrl.replace(/\/api\/v1\/?$/, "");
}

// Not auto-connected (autoConnect: false) — the queue console explicitly
// connects when it mounts and disconnects when it unmounts, rather than
// holding one open socket for the lifetime of the whole app regardless of
// which page is showing.
function createQueueSocket() {
  return io(getSocketOrigin(), { autoConnect: false });
}

export { createQueueSocket };
