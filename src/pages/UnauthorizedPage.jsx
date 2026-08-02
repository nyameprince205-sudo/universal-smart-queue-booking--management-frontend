import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHomeRouteForRole } from "../routes/roleHomeRoutes";

function UnauthorizedPage() {
  const { profile } = useAuth();
  const homeRoute = profile ? getHomeRouteForRole(profile.role) : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-800">You don't have access to this page</h1>
        <p className="mt-2 text-slate-500">Your account doesn't have the permissions this page requires.</p>
        <Link to={homeRoute} className="mt-4 inline-block text-sky-600 hover:underline">
          Back to your dashboard
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
