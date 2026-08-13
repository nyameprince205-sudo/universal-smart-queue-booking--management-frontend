import apiClient from "./client";

async function listBookings(date, branchId) {
  const params = {};
  if (date) params.date = date;
  if (branchId) params.branchId = branchId;
  const { data } = await apiClient.get("/bookings", { params });
  return data;
}

async function createBooking(payload) {
  const { data } = await apiClient.post("/bookings", payload);
  return data;
}

export { listBookings, createBooking };
