import apiClient from "./client";

async function listStaff() {
  const { data } = await apiClient.get("/staff");
  return data;
}

async function createStaff(payload) {
  const { data } = await apiClient.post("/staff", payload);
  return data;
}

async function deactivateStaff(id) {
  const { data } = await apiClient.patch(`/staff/${id}/deactivate`);
  return data;
}

async function reactivateStaff(id) {
  const { data } = await apiClient.patch(`/staff/${id}/reactivate`);
  return data;
}

export { listStaff, createStaff, deactivateStaff, reactivateStaff };
