import apiClient from "./client";
async function listServices() {
  const {
    data
  } = await apiClient.get("/services");
  return data;
}
async function createService(payload) {
  const {
    data
  } = await apiClient.post("/services", payload);
  return data;
}
async function updateService(id, payload) {
  const {
    data
  } = await apiClient.patch(`/services/${id}`, payload);
  return data;
}
async function deactivateService(id) {
  await apiClient.delete(`/services/${id}`);
}
export { listServices, createService, updateService, deactivateService };