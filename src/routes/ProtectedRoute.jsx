import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function ProtectedRoute({
  authType,
  allowedRoles,
  children
}) {
  const {
    loading,
    isAuthenticated,
    authType: currentAuthType,
    profile
  } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated || currentAuthType !== authType) {
    const loginPath = authType === "customer" ? "/customer/login" : "/login";
    return <Navigate to={loginPath} state={{
      from: location
    }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
export default ProtectedRoute;