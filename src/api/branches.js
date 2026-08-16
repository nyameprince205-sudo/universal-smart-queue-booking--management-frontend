import apiClient from "./client";
async function listBranches() {
  const {
    data
  } = await apiClient.get("/branches");
  return data;
}
async function createBranch(payload) {
  const {
    data
  } = await apiClient.post("/branches", payload);
  return data;
}
async function updateBranch(id, payload) {
  const {
    data
  } = await apiClient.patch(`/branches/${id}`, payload);
  return data;
}
export { listBranches, createBranch, updateBranch };