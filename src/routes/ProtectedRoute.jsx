import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guards a route behind BOTH a required identity type (staff vs customer —
// these are different login systems entirely) AND, optionally, a specific
// list of roles within that type (e.g. only SUPER_ADMIN should reach
// /platform, even though SUPER_ADMIN and ORG_ADMIN are both "staff").
//
// `authType` — "staff" | "customer" — which login system this route needs.
// `allowedRoles` — optional array like ["SUPER_ADMIN"]; if omitted, any
//   logged-in identity of the right authType can access the route.
function ProtectedRoute({ authType, allowedRoles, children }) {
  const { loading, isAuthenticated, authType: currentAuthType, profile } = useAuth();
  const location = useLocation();

  // Auth state hasn't finished checking localStorage yet (happens for one
  // render on page load/refresh) — render nothing rather than redirecting
  // prematurely, which would bounce a genuinely logged-in user to the
  // login page for a split second on every refresh.
  if (loading) return null;

  if (!isAuthenticated || currentAuthType !== authType) {
    // `state: { from: location }` is what lets the login page send the
    // user back to the page they actually wanted, instead of always
    // dropping them on a generic default after logging in.
    const loginPath = authType === "customer" ? "/customer/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
