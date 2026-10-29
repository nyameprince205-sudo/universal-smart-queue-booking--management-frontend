import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  UserRound,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import PasswordInput from "../../components/PasswordInput";

function CustomerLoginPage() {
  const { loginCustomer } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Accept Ghanaian local and international formats.
  // Local: 0241234567 (10 digits)
  // International: +233241234567 (13 characters)
  function handlePhoneChange(event) {
    const value = event.target.value;

    if (value === "") {
      setPhone("");
      setError(null);
      return;
    }

    if (value.startsWith("+")) {
      const digits = value.slice(1).replace(/\D/g, "");

      // Only allow the +233 country code.
      if (!digits.startsWith("233")) {
        return;
      }

      // 233 + 9 subscriber digits = 12 digits after "+".
      setPhone(`+${digits.slice(0, 12)}`);
      setError(null);
      return;
    }

    // Local numbers: digits only, maximum 10.
    const digits = value.replace(/\D/g, "").slice(0, 10);

    // Local numbers must start with 0.
    if (digits.length > 0 && !digits.startsWith("0")) {
      return;
    }

    setPhone(digits);
    setError(null);
  }

  function isValidGhanaPhone(value) {
    return /^(0\d{9}|\+233\d{9})$/.test(value);
  }

  const phoneIsValid = isValidGhanaPhone(phone);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setError(null);

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!isValidGhanaPhone(phone.trim())) {
      setError(
        "Enter a valid Ghanaian phone number: 10 digits starting with 0, or +233 followed by 9 digits."
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);

    try {
      await loginCustomer(phone.trim(), password);

      const requestedDestination = location.state?.from?.pathname;

      const destination =
        typeof requestedDestination === "string" &&
        requestedDestination.startsWith("/") &&
        !requestedDestination.startsWith("//")
          ? requestedDestination
          : "/";

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to sign in. Please check your phone number and password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="surface-texture-subtle relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-bg px-4 py-10">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl"
      />

      <section className="relative w-full max-w-md">
        {/* Header */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
            <CalendarCheck size={30} strokeWidth={1.8} aria-hidden="true" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
            <ShieldCheck
              size={14}
              className="text-emerald-600"
              aria-hidden="true"
            />
            Customer Portal
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
            Sign in to book services, manage your appointments, and check your
            queue status.
          </p>
        </div>

        {/* Login form */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Sign in to your account
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter your registered phone number and password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <p>{error}</p>
              </div>
            )}

            {/* Phone number */}
            <div>
              <label
                htmlFor="customer-phone"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Phone number
              </label>

              <input
                id="customer-phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                maxLength={13}
                placeholder="0241234567 or +233241234567"
                value={phone}
                onChange={handlePhoneChange}
                aria-invalid={phone.length > 0 && !phoneIsValid}
                aria-describedby="customer-phone-help"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <p
                id="customer-phone-help"
                className="mt-1.5 text-xs leading-5 text-slate-500"
              >
                Use 10 digits starting with 0, or +233 followed by 9 digits.
              </p>

              {phone.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className={
                      phoneIsValid ? "text-emerald-600" : "text-slate-300"
                    }
                    aria-hidden="true"
                  />

                  <span
                    className={`text-xs ${
                      phoneIsValid ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {phoneIsValid
                      ? "Phone number format is valid"
                      : "Complete the phone number"}
                  </span>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="customer-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <Link
                  to="/customer/forgot-password"
                  className="text-sm font-medium text-sky-700 transition hover:text-sky-800 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  Forgot password?
                </Link>
              </div>

              <PasswordInput
                id="customer-password"
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
              disabled={submitting || !phone.trim() || !password}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-600/20 disabled:cursor-not-allowed disabled:opacity-60"
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

          {/* Registration */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">NEW CUSTOMER?</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm">
              <UserRound size={20} aria-hidden="true" />
            </div>

            <p className="text-sm font-medium text-slate-800">
              Don't have an account yet?
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Create an account to get started with bookings and queue
              management.
            </p>

            <Link
              to="/customer/register"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              Create an account
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Staff login */}
        <div className="mt-5 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-4 text-center">
          <p className="text-sm text-slate-600">
            Are you a staff member or administrator?
          </p>

          <Link
            to="/login"
            className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-800 transition hover:text-sky-700 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Staff &amp; Admin Login
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Your queue and booking information are accessible after you sign in.
          <br />
          Keep your account credentials private.
        </p>
      </section>
    </main>
  );
}

export default CustomerLoginPage;

