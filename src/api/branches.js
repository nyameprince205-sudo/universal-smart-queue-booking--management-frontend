import apiClient from "./client";

// Thin wrappers over branch.routes.js — same reasoning as reports.js: the
// URL and payload shape for each call lives in exactly one place.

async function listBranches() {
  const { data } = await apiClient.get("/branches");
  return data;
}

async function createBranch(payload) {
  const { data } = await apiClient.post("/branches", payload);
  return data;
}

async function updateBranch(id, payload) {
  const { data } = await apiClient.patch(`/branches/${id}`, payload);
  return data;
}

export { listBranches, createBranch, updateBranch };
