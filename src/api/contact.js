import apiClient from "./client";
async function submitContactForm(payload) {
  const {
    data
  } = await apiClient.post("/contact", payload);
  return data;
}
async function listContactSubmissions(unreadOnly) {
  const {
    data
  } = await apiClient.get("/contact", {
    params: unreadOnly ? {
      unreadOnly: "true"
    } : {}
  });
  return data;
}
async function markContactSubmissionRead(id) {
  const {
    data
  } = await apiClient.patch(`/contact/${id}/read`);
  return data;
}
export { submitContactForm, listContactSubmissions, markContactSubmissionRead };