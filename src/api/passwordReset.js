import apiClient from "./client";

// Staff/admin request forgot-password by EMAIL — matches auth.controller.js.
async function requestStaffPasswordReset(email) {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data;
}

// Customers request forgot-password by PHONE, not email — see
// customer.controller.js's forgotPassword comment for why: phone is a
// customer's actual login identifier (email is optional and many
// quick-registered guests don't have one), so keying this on email the
// way the spec literally describes would exclude a lot of real customers.
async function requestCustomerPasswordReset(phone) {
  const { data } = await apiClient.post("/customers/forgot-password", { phone });
  return data;
}

// SHARED reset endpoint — one call serves both staff and customer resets.
// The token itself (opaque to the frontend) tells the backend which
// account type to update; this function doesn't need to know or care.
async function resetPassword(token, newPassword) {
  const { data } = await apiClient.post("/auth/reset-password", { token, newPassword });
  return data;
}

// Verification is staff/admin-only (see auth.controller.js's verifyEmail —
// Task 3 explicitly scopes this to Super Admin/Org Admin/Staff, not
// customers), so there's only one of each of these, not a staff/customer
// pair like the reset-request functions above.
async function verifyEmail(token) {
  const { data } = await apiClient.post("/auth/verify-email", { token });
  return data;
}

async function resendVerification(email) {
  const { data } = await apiClient.post("/auth/resend-verification", { email });
  return data;
}

export { requestStaffPasswordReset, requestCustomerPasswordReset, resetPassword, verifyEmail, resendVerification };
