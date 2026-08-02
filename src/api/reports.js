import apiClient from "./client";

// Thin wrapper functions over the Phase 14 report endpoints. Kept separate
// from the raw apiClient calls (rather than calling apiClient.get(...)
// directly inside components) so the URL and param shape for each report
// lives in exactly one place — if a report's query params ever change, this
// is the only file that needs to know.

function buildParams({ startDate, endDate, branchId } = {}) {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (branchId) params.branchId = branchId;
  return params;
}

async function getDashboardSummary(filters) {
  const { data } = await apiClient.get("/reports/dashboard", { params: buildParams(filters) });
  return data;
}

async function getBookingReport(filters) {
  const { data } = await apiClient.get("/reports/bookings", { params: buildParams(filters) });
  return data;
}

async function getQueuePerformanceReport(filters) {
  const { data } = await apiClient.get("/reports/queue-performance", { params: buildParams(filters) });
  return data;
}

async function getNoShowReport(filters) {
  const { data } = await apiClient.get("/reports/no-shows", { params: buildParams(filters) });
  return data;
}

export { getDashboardSummary, getBookingReport, getQueuePerformanceReport, getNoShowReport };
