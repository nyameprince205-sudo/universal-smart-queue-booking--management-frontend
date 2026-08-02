import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHomeRouteForRole } from "../../routes/roleHomeRoutes";

function StaffLoginPage() {
  const { loginStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await loginStaff(email, password);
      // If ProtectedRoute sent us here because the user tried to visit a
      // specific page while logged out, send them back to THAT page —
      // otherwise fall back to wherever their role normally lands.
      const destination = location.state?.from?.pathname || getHomeRouteForRole(user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      // The backend deliberately returns the same vague message for "no
      // such email" and "wrong password" (see auth.controller.js) so we
      // don't need — or want — to distinguish them here either.
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-800 text-center">Staff &amp; Admin Login</h1>
        <p className="mt-1 text-sm text-slate-500 text-center">Sign in to manage your organization.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Booking a service instead?{" "}
          <Link to="/customer/login" className="text-sky-600 hover:underline">
            Customer login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default StaffLoginPage;
