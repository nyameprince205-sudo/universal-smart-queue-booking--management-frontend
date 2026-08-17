import apiClient from "./client";
async function createTicket(payload) {
  const {
    data
  } = await apiClient.post("/support", payload);
  return data;
}
async function listMyTickets() {
  const {
    data
  } = await apiClient.get("/support/mine");
  return data;
}
async function listInboxTickets(status) {
  const {
    data
  } = await apiClient.get("/support/inbox", {
    params: status ? {
      status
    } : {}
  });
  return data;
}
async function getTicket(id) {
  const {
    data
  } = await apiClient.get(`/support/${id}`);
  return data;
}
async function replyToTicket(id, message) {
  const {
    data
  } = await apiClient.post(`/support/${id}/reply`, {
    message
  });
  return data;
}
async function resolveTicket(id) {
  const {
    data
  } = await apiClient.patch(`/support/${id}/resolve`);
  return data;
}
export { createTicket, listMyTickets, listInboxTickets, getTicket, replyToTicket, resolveTicket };