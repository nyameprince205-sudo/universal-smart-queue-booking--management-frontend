import apiClient from "./client";

async function lookupCustomerByPhone(phone) {
  const { data } = await apiClient.get("/customers/lookup", { params: { phone } });
  return data;
}

async function quickRegisterCustomer(payload) {
  const { data } = await apiClient.post("/customers/quick-register", payload);
  return data;
}

// New — the Org Admin customer list, answering "which customers has my
// business actually served, and who among them has a real account."
async function listMyCustomers() {
  const { data } = await apiClient.get("/customers");
  return data;
}

export { lookupCustomerByPhone, quickRegisterCustomer, listMyCustomers };
