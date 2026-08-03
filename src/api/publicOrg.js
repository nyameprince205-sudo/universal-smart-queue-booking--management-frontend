import apiClient from "./client";

// The one endpoint in this app that's called with NO token attached most
// of the time — a customer can view an org's booking page before they've
// ever logged in. apiClient's request interceptor only ATTACHES a token
// when one exists in storage; it never requires one, so this works
// identically whether the visitor is logged in or not.
async function getPublicOrganization(slug) {
  const { data } = await apiClient.get(`/organizations/public/${slug}`);
  return data;
}

export { getPublicOrganization };
