import apiClient from "./client";

// listPlans is the only PUBLIC endpoint here (no auth needed to see
// pricing) — but calling it through the same authenticated apiClient is
// still fine, since the request interceptor only ATTACHES a token if one
// exists; it doesn't require one.

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

export { listPlans, getMySubscription, initializeSubscription, verifyPayment };
