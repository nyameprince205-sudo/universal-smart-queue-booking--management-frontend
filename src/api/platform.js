import apiClient from "./client";

async function listOrganizations() {
  const { data } = await apiClient.get("/organizations");
  return data;
}

async function createOrganization(payload) {
  const { data } = await apiClient.post("/organizations", payload);
  return data;
}

async function updateOrganizationStatus(id, status) {
  const { data } = await apiClient.patch(`/organizations/${id}/status`, { status });
  return data;
}

async function listBusinessTypes() {
  const { data } = await apiClient.get("/business-types");
  return data;
}

export { listOrganizations, createOrganization, updateOrganizationStatus, listBusinessTypes };
