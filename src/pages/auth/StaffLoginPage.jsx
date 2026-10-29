import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldCheck, Building2, ArrowRight, LockKeyhole } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getHomeRouteForRole } from "../../routes/roleHomeRoutes";
import PasswordInput from "../../components/PasswordInput";

function StaffLoginPage() {
const { loginStaff } = useAuth();
const navigate = useNavigate();
const location = useLocation();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState(null);
const [submitting, setSubmitting] = useState(false);

async function handleSubmit(event) {
event.preventDefault();


if (submitting) return;

setError(null);
setSubmitting(true);

try {
  const user = await loginStaff(email.trim(), password);

  const requestedDestination = location.state?.from?.pathname;
  const fallbackDestination = getHomeRouteForRole(user.role);

  // Only use internal application paths for post-login navigation.
  const destination =
    typeof requestedDestination === "string" &&
    requestedDestination.startsWith("/") &&
    !requestedDestination.startsWith("//")
      ? requestedDestination
      : fallbackDestination;

  navigate(destination, { replace: true });
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Unable to sign in. Please check your details and try again."
  );
} finally {
  setSubmitting(false);
}


}

return ( <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-bg px-4 py-10 surface-texture-subtle">
{/* Decorative background elements */} <div
     aria-hidden="true"
     className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/20 blur-3xl"
   />


  <div
    aria-hidden="true"
    className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl"
  />

  <section className="relative w-full max-w-md">
    {/* Brand / icon */}
    <div className="mb-6 flex justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
        <Building2 size={30} strokeWidth={1.7} aria-hidden="true" />
      </div>
    </div>

    {/* Heading */}
    <div className="mb-8 text-center">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
        <ShieldCheck
          size={14}
          className="text-emerald-600"
          aria-hidden="true"
        />
        Secure Staff Portal
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Staff &amp; Admin Login
      </h1>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
        Welcome back. Sign in to manage your organization, bookings, and
        queue operations.
      </p>
    </div>

    {/* Login card */}
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Sign in to your account
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter your staff or administrator credentials below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700"
          >
            <span className="mt-0.5 font-bold" aria-hidden="true">
              !
            </span>
            <p>{error}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="staff-email"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email address
          </label>

          <input
            id="staff-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label
              htmlFor="staff-password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-sky-700 transition hover:text-sky-800 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              Forgot password?
            </Link>
          </div>

          <PasswordInput
            id="staff-password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !email.trim() || !password}
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Signing in...
            </>
          ) : (
            <>
              <LockKeyhole size={16} aria-hidden="true" />
              Sign in securely
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs text-slate-400">OR</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <div className="rounded-lg bg-slate-50 px-4 py-3.5 text-center">
        <p className="text-sm text-slate-600">
          Booking a service instead?
        </p>

        <Link
          to="/customer/login"
          className="mt-1 inline-flex items-center gap-1 font-semibold text-sky-700 transition hover:text-sky-800 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          Customer login
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>

    {/* Footer */}
    <p className="mt-6 text-center text-xs leading-5 text-slate-500">
      Authorized staff and administrators only.
      <br />
      Keep your account credentials private.
    </p>
  </section>
</main>


);
}

export default StaffLoginPage;
