import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";

// There's no "browse all businesses" page, on purpose — the real backend
// has no public endpoint that lists every organization on the platform
// (only SUPER_ADMIN can list them all; see organization.routes.js). This
// mirrors how a lot of real booking SaaS products actually work (Calendly,
// for instance): each business gets its OWN shareable booking link
// (/book/their-slug), which they hand out themselves — there's no public
// directory to browse. So this page just orients a signed-in customer
// toward their own bookings, not toward businesses they haven't been
// linked to yet.
function CustomerHomePage() {
  const { profile, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {isAuthenticated ? `Welcome, ${profile?.name}` : "Welcome"}
          </h1>
          {!isAuthenticated && (
            <p className="mt-2 text-slate-500">
              Sign in to book a service, or use a business's booking link to get started.
            </p>
          )}
        </div>
        {isAuthenticated && <LogoutButton />}
      </div>

      {isAuthenticated && (
        <Link
          to="/my-bookings"
          className="mt-6 inline-block rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors"
        >
          View My Bookings
        </Link>
      )}

      {!isAuthenticated && (
        <Link to="/customer/login" className="mt-4 inline-block text-sky-600 hover:underline text-sm">
          Sign in
        </Link>
      )}
    </div>
  );
}

export default CustomerHomePage;
