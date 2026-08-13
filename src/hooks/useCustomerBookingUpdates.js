import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createQueueSocket } from "../api/socket";

// Shared by MyBookingsPage and the homepage's Recent Bookings section —
// anywhere a customer sees their own booking statuses, this makes them
// update live instead of needing a manual refresh. Reuses the same
// customer-scoped Socket.IO room backend/socket.js added: a customer's
// bookings can span multiple organizations (see
// customer.controller.js's getMyOrganizationHistory comment), so this
// room is keyed by their OWN id, not any one business's branch — a status
// change anywhere reaches them, and reaches only them.
//
// NOTE: assumes `profile.id` holds the logged-in customer's own id. If
// live updates don't seem to arrive, check the browser console for the
// "customer booking updates: no profile.id available" warning below —
// that means AuthContext's real field name differs and needs a one-line
// fix here to match.
function useCustomerBookingUpdates(onUpdate) {
  const { profile, isAuthenticated, authType } = useAuth();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authType, profile?.id]);
}

export default useCustomerBookingUpdates;
