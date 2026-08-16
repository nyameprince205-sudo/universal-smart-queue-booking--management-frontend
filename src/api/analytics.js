import apiClient from "./client";
function buildParams({
  startDate,
  endDate,
  branchId,
  granularity
} = {}) {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (branchId) params.branchId = branchId;
  if (granularity) params.granularity = granularity;
  return params;
}
async function getServicePopularity(filters) {
  const {
    data
  } = await apiClient.get("/analytics/service-popularity", {
    params: buildParams(filters)
  });
  return data;
}
async function getPeakHours(filters) {
  const {
    data
  } = await apiClient.get("/analytics/peak-hours", {
    params: buildParams(filters)
  });
  return data;
}
async function getBookingTrends(filters) {
  const {
    data
  } = await apiClient.get("/analytics/trends", {
    params: buildParams(filters)
  });
  return data;
}
async function getStaffPerformance(filters) {
  const {
    data
  } = await apiClient.get("/analytics/staff-performance", {
    params: buildParams(filters)
  });
  return data;
}
async function getBranchComparison(filters) {
  const {
    data
  } = await apiClient.get("/analytics/branches", {
    params: buildParams(filters)
  });
  return data;
}
async function getRevenueReport(filters) {
  const {
    data
  } = await apiClient.get("/analytics/revenue", {
    params: buildParams(filters)
  });
  return data;
}
async function getExecutiveSummary() {
  const {
    data
  } = await apiClient.get("/analytics/executive-summary");
  return data;
}
async function getHomeDashboard() {
  const {
    data
  } = await apiClient.get("/analytics/home-dashboard");
  return data;
}
export { getServicePopularity, getHomeDashboard, getPeakHours, getBookingTrends, getStaffPerformance, getBranchComparison, getRevenueReport, getExecutiveSummary };