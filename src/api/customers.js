import apiClient from "./client";

// These two are the STAFF-side customer endpoints (customer.routes.js's
// "used during check-in" section) — distinct from the customer
// self-service register/login endpoints Step 2 already wraps. A staff
// member calling this is looking up or creating a walk-in customer record
// on someone else's behalf, not authenticating as that customer.

async function lookupCustomerByPhone(phone) {
  const { data } = await apiClient.get("/customers/lookup", { params: { phone } });
  return data;
}

async function quickRegisterCustomer(payload) {
  const { data } = await apiClient.post("/customers/quick-register", payload);
  return data;
}

export { lookupCustomerByPhone, quickRegisterCustomer };
