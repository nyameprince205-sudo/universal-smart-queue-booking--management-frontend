import apiClient from "./client";

async function listMyBookings() {
  const { data } = await apiClient.get("/bookings/mine");
  return data;
}

async function createMyBooking(payload) {
  const { data } = await apiClient.post("/bookings/mine", payload);
  return data;
}

async function cancelMyBooking(id) {
  const { data } = await apiClient.patch(`/bookings/mine/${id}/cancel`);
  return data;
}

// Task 4: no auth at all — lives alongside the authenticated functions
// above because it's the same booking domain (matches how booking.routes.js
// groups /bookings/guest with /bookings/mine server-side too), just a
// different auth requirement. Takes the guest's name/phone/email directly
// in the payload since there's no JWT to read an identity from.
async function createGuestBooking(payload) {
  const { data } = await apiClient.post("/bookings/guest", payload);
  return data;
}

export { listMyBookings, createMyBooking, cancelMyBooking, createGuestBooking };
