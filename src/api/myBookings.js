import apiClient from "./client";
async function listMyBookings() {
  const {
    data
  } = await apiClient.get("/bookings/mine");
  return data;
}
async function createMyBooking(payload) {
  const {
    data
  } = await apiClient.post("/bookings/mine", payload);
  return data;
}
async function cancelMyBooking(id) {
  const {
    data
  } = await apiClient.patch(`/bookings/mine/${id}/cancel`);
  return data;
}
async function createGuestBooking(payload) {
  const {
    data
  } = await apiClient.post("/bookings/guest", payload);
  return data;
}
export { listMyBookings, createMyBooking, cancelMyBooking, createGuestBooking };