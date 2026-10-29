import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
ArrowLeft,
ArrowRight,
BadgeCheck,
CheckCircle2,
ShieldCheck,
MailCheck,
AlertCircle,
RefreshCw,
} from "lucide-react";
import { verifyEmail } from "../../api/passwordReset";

function VerifyEmailPage() {
const [searchParams] = useSearchParams();
const token = searchParams.get("token");

const [status, setStatus] = useState("verifying");
const [errorMessage, setErrorMessage] = useState("");

const hasRun = useRef(false);

useEffect(() => {
if (hasRun.current) return;


hasRun.current = true;

if (!token) {
  setStatus("error");
  setErrorMessage(
    "This verification link is missing its security token. Request a new link to continue."
  );
  return;
}

let cancelled = false;

async function verify() {
  try {
    await verifyEmail(token);

    if (!cancelled) {
      setStatus("success");
    }
  } catch (err) {
    if (!cancelled) {
      setStatus("error");
      setErrorMessage(
        err.response?.data?.error ||
          "This verification link is invalid or has expired. Request a new link to continue."
      );
    }
  }
}

verify();

return () => {
  cancelled = true;
};


}, [token]);

return ( <div className="surface-texture-subtle relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-bg px-4 py-10 sm:px-6">
{/* Decorative background */} <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" /> <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />


  <div className="relative w-full max-w-md">
    <div className="rounded-2xl border border-white/80 bg-white/95 p-7 text-center shadow-xl shadow-slate-900/5 backdrop-blur sm:p-9">
      {/* Verifying state */}
      {status === "verifying" && (
        <>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <RefreshCw size={30} className="animate-spin" />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
            Account verification
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Verifying your email
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please wait while we confirm your email address. This should
            only take a moment.
          </p>

          <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-sky-500" />
          </div>
        </>
      )}

      {/* Success state */}
      {status === "success" && (
        <>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={34} strokeWidth={1.8} />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Verification complete
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Email verified!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your email address has been confirmed successfully. You can
            now continue to sign in to your account.
          </p>

          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <MailCheck
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  You're verified
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  Your email verification step is complete.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-600/15 transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
          >
            Continue to sign in
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/customer/login"
            className="mt-4 inline-flex items-center justify-center text-sm font-medium text-slate-500 transition hover:text-sky-700"
          >
            Customer sign in
          </Link>
        </>
      )}

      {/* Error state */}
      {status === "error" && (
        <>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle size={32} strokeWidth={1.8} />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            Verification issue
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Verification unsuccessful
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {errorMessage}
          </p>

          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <BadgeCheck
                size={20}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-sm font-semibold text-amber-900">
                  What you can do
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  Request a new verification email and open the latest link
                  sent to your inbox.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/resend-verification"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-600/15 transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
          >
            <RefreshCw size={17} />
            Request a new verification link
          </Link>

          <Link
            to="/login"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-700"
          >
            <ArrowLeft size={16} />
            Back to staff sign in
          </Link>
        </>
      )}
    </div>

    {/* Security note */}
    <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
      <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
      <span>Your account verification is handled securely.</span>
    </div>
  </div>
</div>


);
}

export default VerifyEmailPage;
