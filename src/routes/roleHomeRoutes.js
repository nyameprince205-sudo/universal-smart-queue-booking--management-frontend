const ROLE_HOME_ROUTES = {
  SUPER_ADMIN: "/platform",
  ORG_ADMIN: "/admin/dashboard",
  STAFF: "/staff/queue"
};
function getHomeRouteForRole(role) {
  return ROLE_HOME_ROUTES[role] || "/login";
}
export { getHomeRouteForRole };