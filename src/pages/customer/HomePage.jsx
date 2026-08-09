import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";

// Reversed from the earlier design here (see git history — this page used
// to explicitly say "no browse page, on purpose"). Real usage showed that
// decision was wrong: a customer landing on this page after logging in had
// nowhere to go except a "My Bookings" list that starts out empty. Module 3
// (organization search) now exists, so this page's job is to actually
// surface it, not just orient people toward bookings they don't have yet.
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
            <p className="mt-2 text-slate-500">Find a business below to book a service — no account required.</p>
          )}
        </div>
        {isAuthenticated && <LogoutButton />}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/organizations"
          className="rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors"
        >
          Find a Business
        </Link>
        {isAuthenticated && (
          <Link
            to="/my-bookings"
            className="rounded-md border border-slate-300 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-white transition-colors"
          >
            My Bookings
          </Link>
        )}
      </div>

      {!isAuthenticated && (
        <Link to="/customer/login" className="mt-4 inline-block text-sky-600 hover:underline text-sm">
          Sign in
        </Link>
      )}
    </div>
  );
}

export default CustomerHomePage;
