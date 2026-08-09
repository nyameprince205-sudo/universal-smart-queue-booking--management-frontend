import apiClient from "./client";

async function listStaff() {
  const { data } = await apiClient.get("/staff");
  return data;
}

async function createStaff(payload) {
  const { data } = await apiClient.post("/staff", payload);
  return data;
}

export { listStaff, createStaff };
