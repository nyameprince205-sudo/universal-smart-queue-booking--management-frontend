import apiClient from "./client";

// Note there's no updateService — service.routes.js only exposes
// create/list/deactivate (see service.controller.js's comment about not
// over-abstracting yet). The frontend below reflects that: no edit form,
// only add + deactivate.

async function listServices() {
  const { data } = await apiClient.get("/services");
  return data;
}

async function createService(payload) {
  const { data } = await apiClient.post("/services", payload);
  return data;
}

async function deactivateService(id) {
  await apiClient.delete(`/services/${id}`);
}

export { listServices, createService, deactivateService };
