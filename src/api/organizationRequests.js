import apiClient from "./client";

async function submitOrganizationRequest(payload) {
  const { data } = await apiClient.post("/organization-requests", payload);
  return data;
}

async function listOrganizationRequests(status) {
  const { data } = await apiClient.get("/organization-requests", { params: status ? { status } : {} });
  return data;
}

async function reviewOrganizationRequest(id, status, businessTypeId, reviewNotes) {
  const { data } = await apiClient.patch(`/organization-requests/${id}/review`, { status, businessTypeId, reviewNotes });
  return data;
}

export { submitOrganizationRequest, listOrganizationRequests, reviewOrganizationRequest };
