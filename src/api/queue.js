import apiClient from "./client";

function buildBranchParams(branchId) {
  return branchId ? { branchId } : {};
}

async function getBoard(branchId) {
  const { data } = await apiClient.get("/queue/board", { params: buildBranchParams(branchId) });
  return data;
}

async function listCounters(branchId) {
  const { data } = await apiClient.get("/queue/counters", { params: buildBranchParams(branchId) });
  return data;
}

async function checkIn(payload) {
  const { data } = await apiClient.post("/queue/check-in", payload);
  return data;
}

async function callNext(counterId) {
  const { data } = await apiClient.post("/queue/call-next", { counterId });
  return data;
}

async function markServing(ticketId) {
  const { data } = await apiClient.patch(`/queue/${ticketId}/serving`);
  return data;
}

async function completeTicket(ticketId) {
  const { data } = await apiClient.patch(`/queue/${ticketId}/complete`);
  return data;
}

export { getBoard, listCounters, checkIn, callNext, markServing, completeTicket };
