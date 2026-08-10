import apiClient from "./client";

async function listPlans() {
  const { data } = await apiClient.get("/subscriptions/plans");
  return data;
}

async function getMySubscription() {
  const { data } = await apiClient.get("/subscriptions/me");
  return data;
}

async function initializeSubscription(planId) {
  const { data } = await apiClient.post("/subscriptions/initialize", { planId });
  return data;
}

async function verifyPayment(reference) {
  const { data } = await apiClient.get(`/subscriptions/verify/${reference}`);
  return data;
}

// Phase 18, Module 6 addition — the backend endpoint (Payment table)
// already existed since Phase 13; nothing read it back until now.
async function listPaymentHistory() {
  const { data } = await apiClient.get("/subscriptions/payments");
  return data;
}

export { listPlans, getMySubscription, initializeSubscription, verifyPayment, listPaymentHistory };
