import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../../api/passwordReset";

// SHARED between staff/admin and customer resets — the token itself tells
// the backend which account type to update (see auth.controller.js's
// resetPassword), so this one page serves both. It has no way to know —
// or need to know — which kind of account it's resetting.
//
// Mirrors passwordStrength.js's actual server-side rule exactly (8+ chars,
// at least one letter, at least one number) so a person sees a clear,
// specific reason immediately instead of typing a password, submitting,
// and only THEN learning it was too weak from a generic server error.
function validateStrength(password) {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    const strengthError = validateStrength(newPassword);
    if (strengthError) {
      setError(strengthError);
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      // Covers an invalid/expired/already-used token — see
      // authToken.service.js's consumeToken, which deliberately collapses
      // all three into one outcome.
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // No token in the URL at all — someone navigated here directly rather
  // than through a real reset link. Don't even show the form.
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Invalid link</h1>
          <p className="mt-2 text-sm text-slate-500">
            This password reset link is missing its token. Please use the link from your email.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Password reset</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your password has been changed. Please log in again — for security, any devices you were
            signed in on have been signed out.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/login"
              className="rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 transition-colors"
            >
              Staff &amp; Admin sign in
            </Link>
            <Link
              to="/customer/login"
              className="rounded-md border border-slate-300 text-slate-700 py-2 font-medium hover:bg-slate-50 transition-colors"
            >
              Customer sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-800 text-center">Reset Password</h1>
        <p className="mt-1 text-sm text-slate-500 text-center">Choose a new password below.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <p className="mt-1 text-xs text-slate-400">At least 8 characters, with a letter and a number.</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-sky-600 text-white py-2 font-medium hover:bg-sky-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Resetting…" : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
