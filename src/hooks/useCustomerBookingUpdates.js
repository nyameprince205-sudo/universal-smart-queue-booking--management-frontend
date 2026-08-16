import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createQueueSocket } from "../api/socket";
function useCustomerBookingUpdates(onUpdate) {
  const {
    profile,
    isAuthenticated,
    authType
  } = useAuth();
  const socketRef = useRef(null);
  useEffect(() => {
    if (!isAuthenticated || authType !== "customer") return;
    if (!profile?.id) {
      console.warn("customer booking updates: no profile.id available — live updates won't connect.");
      return;
    }
    const socket = createQueueSocket();
    socketRef.current = socket;
    socket.connect();
    socket.emit("join-customer-updates", profile.id);
    socket.on("booking:update", onUpdate);
    return () => {
      socket.emit("leave-customer-updates", profile.id);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, authType, profile?.id]);
}
export default useCustomerBookingUpdates;