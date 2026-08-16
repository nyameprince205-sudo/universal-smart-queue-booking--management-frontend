import apiClient from "./client";
function buildParams({
  startDate,
  endDate,
  branchId
} = {}) {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (branchId) params.branchId = branchId;
  return params;
}
async function getDashboardSummary(filters) {
  const {
    data
  } = await apiClient.get("/reports/dashboard", {
    params: buildParams(filters)
  });
  return data;
}
async function getBookingReport(filters) {
  const {
    data
  } = await apiClient.get("/reports/bookings", {
    params: buildParams(filters)
  });
  return data;
}
async function getQueuePerformanceReport(filters) {
  const {
    data
  } = await apiClient.get("/reports/queue-performance", {
    params: buildParams(filters)
  });
  return data;
}
async function getNoShowReport(filters) {
  const {
    data
  } = await apiClient.get("/reports/no-shows", {
    params: buildParams(filters)
  });
  return data;
}
export { getDashboardSummary, getBookingReport, getQueuePerformanceReport, getNoShowReport };