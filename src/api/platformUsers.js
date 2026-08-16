import apiClient from "./client";
async function listOrgAdmins() {
  const {
    data
  } = await apiClient.get("/platform-users/org-admins");
  return data;
}
async function deactivateOrgAdmin(id) {
  const {
    data
  } = await apiClient.patch(`/platform-users/org-admins/${id}/deactivate`);
  return data;
}
async function reactivateOrgAdmin(id) {
  const {
    data
  } = await apiClient.patch(`/platform-users/org-admins/${id}/reactivate`);
  return data;
}
export { listOrgAdmins, deactivateOrgAdmin, reactivateOrgAdmin };