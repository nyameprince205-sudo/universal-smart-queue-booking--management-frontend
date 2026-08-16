import apiClient from "./client";
async function listRecentActivity() {
  const {
    data
  } = await apiClient.get("/activity/recent");
  return data;
}
async function getNotificationsCenter() {
  const {
    data
  } = await apiClient.get("/activity/alerts");
  return data;
}
export { listRecentActivity, getNotificationsCenter };