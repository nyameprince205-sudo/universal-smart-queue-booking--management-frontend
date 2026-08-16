import apiClient from "./client";
async function requestStaffPasswordReset(email) {
  const {
    data
  } = await apiClient.post("/auth/forgot-password", {
    email
  });
  return data;
}
async function requestCustomerPasswordReset(phone) {
  const {
    data
  } = await apiClient.post("/customers/forgot-password", {
    phone
  });
  return data;
}
async function resetPassword(token, newPassword) {
  const {
    data
  } = await apiClient.post("/auth/reset-password", {
    token,
    newPassword
  });
  return data;
}
async function verifyEmail(token) {
  const {
    data
  } = await apiClient.post("/auth/verify-email", {
    token
  });
  return data;
}
async function resendVerification(email) {
  const {
    data
  } = await apiClient.post("/auth/resend-verification", {
    email
  });
  return data;
}
export { requestStaffPasswordReset, requestCustomerPasswordReset, resetPassword, verifyEmail, resendVerification };