import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { requestStaffPasswordReset } from "../../api/passwordReset";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await requestStaffPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "We couldn't process your request right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

  return (
    <div className="surface-texture-subtle relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-bg px-4 py-10 sm:px-6">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        {/* Header: top icon and Account recovery badge removed */}
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Forgot your password?
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            It happens. Enter the email address associated with your staff
            account, and we'll help you get back in.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-8">
          {submitted ? (
            <div className="py-3 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={30} aria-hidden="true" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Check your email
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                If an account exists with that email address, a password reset
                link has been sent. Please check your inbox and spam folder.
              </p>

              <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-3 text-left">
                <div className="flex items-start gap-3">
                  <Mail
                    size={18}
                    className="mt-0.5 shrink-0 text-sky-600"
                    aria-hidden="true"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-sky-800">
                      Reset instructions
                    </p>

                    <p className="mt-1 break-all text-sm text-sky-700">
                      {email.trim()}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
              >
                Back to sign in
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />

                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Staff email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      disabled={submitting}
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Use the email address associated with your staff account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-600/15 transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight size={17} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-700"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Return to staff sign in
            </Link>
          </div>
        </div>

        {/* Security note retained */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
          <ShieldCheck
            size={16}
            className="shrink-0 text-emerald-600"
            aria-hidden="true"
          />

          <span>Your account recovery request is handled securely.</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

