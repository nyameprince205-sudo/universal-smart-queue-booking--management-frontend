import { io } from "socket.io-client";
function getSocketOrigin() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
  return apiBaseUrl.replace(/\/api\/v1\/?$/, "");
}
function createQueueSocket() {
  return io(getSocketOrigin(), {
    autoConnect: false
  });
}
export { createQueueSocket };