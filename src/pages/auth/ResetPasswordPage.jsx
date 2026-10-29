import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
ArrowLeft,
ArrowRight,
ShieldCheck,
CheckCircle2,
AlertCircle,
LockKeyhole,
XCircle,
} from "lucide-react";
import { resetPassword } from "../../api/passwordReset";
import PasswordInput from "../../components/PasswordInput";

function validateStrength(password) {
if (password.length < 8) {
return "Password must be at least 8 characters long.";
}

if (!/[a-zA-Z]/.test(password)) {
return "Password must contain at least one letter.";
}

if (!/[0-9]/.test(password)) {
return "Password must contain at least one number.";
}

return null;
}

function ResetPasswordPage() {
const [searchParams] = useSearchParams();
const token = searchParams.get("token");

const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [error, setError] = useState("");
const [submitting, setSubmitting] = useState(false);
const [success, setSuccess] = useState(false);

const hasMinimumLength = newPassword.length >= 8;
const hasLetter = /[a-zA-Z]/.test(newPassword);
const hasNumber = /[0-9]/.test(newPassword);
const passwordsMatch =
confirmPassword.length > 0 && newPassword === confirmPassword;

async function handleSubmit(e) {
e.preventDefault();
setError("");


if (!token) {
  setError("Your reset link is invalid. Please request a new one.");
  return;
}

if (newPassword !== confirmPassword) {
  setError("Your passwords don't match. Please check and try again.");
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
  setError(
    err.response?.data?.error ||
      "We couldn't reset your password. Your link may have expired. Please try again or request a new reset link."
  );
} finally {
  setSubmitting(false);
}


}

const inputClass =
"mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

const Requirement = ({ met, children }) => ( <div className="flex items-center gap-2">
{met ? ( <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
) : ( <XCircle size={15} className="shrink-0 text-slate-300" />
)}


  <span
    className={`text-xs ${
      met ? "text-emerald-700" : "text-slate-500"
    }`}
  >
    {children}
  </span>
</div>


);

// Invalid or missing token
if (!token) {
return ( <div className="surface-texture-subtle relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-bg px-4 py-10"> <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" /> <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />


    <div className="relative w-full max-w-md rounded-2xl border border-white/80 bg-white/95 p-7 text-center shadow-xl shadow-slate-900/5 sm:p-9">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <AlertCircle size={30} />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Invalid reset link
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        This password reset link is missing its security token. Please
        request a new link to continue.
      </p>

      <Link
        to="/forgot-password"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
      >
        Request a new link
        <ArrowRight size={17} />
      </Link>

      <Link
        to="/login"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-700"
      >
        <ArrowLeft size={16} />
        Back to staff sign in
      </Link>
    </div>
  </div>
);


}

// Successful password reset
if (success) {
return ( <div className="surface-texture-subtle relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-bg px-4 py-10"> <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" /> <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />

```
    <div className="relative w-full max-w-md rounded-2xl border border-white/80 bg-white/95 p-7 text-center shadow-xl shadow-slate-900/5 sm:p-9">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={32} />
      </div>

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
        Password updated
      </p>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        You're all set!
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        Your password has been changed successfully. You can now sign in
        using your new password.
      </p>

      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-left">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <p className="text-xs leading-5 text-emerald-800">
            For your security, use your new password the next time you
            sign in. If your backend revokes existing sessions, other
            signed-in devices will need to authenticate again.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          to="/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
        >
          Staff &amp; Admin sign in
          <ArrowRight size={17} />
        </Link>

        <Link
          to="/customer/login"
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
        >
          Customer sign in
        </Link>
      </div>
    </div>
  </div>
);


}

// Reset password form
return ( <div className="surface-texture-subtle relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-bg px-4 py-10 sm:px-6"> <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" /> <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />


  <div className="relative w-full max-w-md">
    <div className="mb-7 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Reset your password
      </h1>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
        Choose a new password for your account. Make it strong and easy for
        you to remember.
      </p>
    </div>

    <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-8">
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-semibold text-slate-700"
          >
            New password
          </label>

          <PasswordInput
            id="newPassword"
            name="newPassword"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            disabled={submitting}
          />

          <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-600">
              Password requirements
            </p>

            <Requirement met={hasMinimumLength}>
              At least 8 characters
            </Requirement>

            <Requirement met={hasLetter}>
              At least one letter
            </Requirement>

            <Requirement met={hasNumber}>
              At least one number
            </Requirement>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-slate-700"
          >
            Confirm new password
          </label>

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            disabled={submitting}
          />

          {confirmPassword.length > 0 && (
            <p
              className={`mt-2 flex items-center gap-1.5 text-xs ${
                passwordsMatch ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {passwordsMatch ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertCircle size={14} />
              )}

              {passwordsMatch
                ? "Passwords match"
                : "Passwords do not match"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-600/15 transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Resetting password...
            </>
          ) : (
            <>
              <LockKeyhole size={17} />
              Reset password
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-700"
        >
          <ArrowLeft size={16} />
          Back to staff sign in
        </Link>
      </div>
    </div>

    <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
      <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
      <span>
        Your password is protected by your account security settings.
      </span>
    </div>
  </div>
</div>


);
}

export default ResetPasswordPage;
