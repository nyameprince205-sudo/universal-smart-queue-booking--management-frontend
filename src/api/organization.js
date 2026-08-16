import apiClient from "./client";
async function getMyOrganization() {
  const {
    data
  } = await apiClient.get("/organizations/me/profile");
  return data;
}
async function updateMyOrganization(payload) {
  const {
    data
  } = await apiClient.patch("/organizations/me/profile", payload);
  return data;
}
export { getMyOrganization, updateMyOrganization };