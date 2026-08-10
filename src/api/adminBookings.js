import apiClient from "./client";

async function listBookings(date) {
  const { data } = await apiClient.get("/bookings", { params: date ? { date } : {} });
  return data;
}

async function createBooking(payload) {
  const { data } = await apiClient.post("/bookings", payload);
  return data;
}

export { listBookings, createBooking };
