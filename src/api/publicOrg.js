import apiClient from "./client";

async function getPublicOrganization(slug) {
  const { data } = await apiClient.get(`/organizations/public/${slug}`);
  return data;
}

// Phase 16, Module 3 addition — powers the new organization search/browse
// page. Same "no token required" reasoning as getPublicOrganization above:
// apiClient only ATTACHES a token when one exists, it never requires one.
async function searchOrganizations(search) {
  const { data } = await apiClient.get("/organizations/public", { params: search ? { search } : {} });
  return data;
}

export { getPublicOrganization, searchOrganizations };
