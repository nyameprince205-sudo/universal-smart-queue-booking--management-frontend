// Where a staff/admin user lands right after logging in, keyed by their
// role name (exactly as the backend returns it in `user.role` — see
// auth.controller.js's login response). Kept in one file so the login
// page and anywhere else that needs "where does this role belong" (e.g. a
// future nav bar's home link) read the same mapping instead of each
// hard-coding their own copy that could drift out of sync.
const ROLE_HOME_ROUTES = {
  SUPER_ADMIN: "/platform",
  ORG_ADMIN: "/admin/dashboard",
  STAFF: "/staff/queue",
};

function getHomeRouteForRole(role) {
  return ROLE_HOME_ROUTES[role] || "/login";
}

export { getHomeRouteForRole };
