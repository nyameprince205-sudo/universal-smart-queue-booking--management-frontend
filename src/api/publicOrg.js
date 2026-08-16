import apiClient from "./client";
async function getPublicOrganization(slug) {
  const {
    data
  } = await apiClient.get(`/organizations/public/${slug}`);
  return data;
}
async function searchOrganizations(search) {
  const {
    data
  } = await apiClient.get("/organizations/public", {
    params: search ? {
      search
    } : {}
  });
  return data;
}
export { getPublicOrganization, searchOrganizations };