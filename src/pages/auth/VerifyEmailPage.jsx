import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../../api/passwordReset";

// Staff/admin only — Task 3 explicitly scopes email verification to Super
// Admin/Org Admin/Staff, not customers, so there's no customer equivalent
// of this page. Auto-submits on mount rather than waiting for a button
// click — the token is already in the URL, so there's nothing for the
// person to actually decide or type; making them click "Verify" again
// would just be a redundant extra step on top of clicking the email link.
function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState(null);

  // React StrictMode (see main.jsx) deliberately mounts every component
  // twice in development to surface side-effect bugs — without this guard,
  // that means TWO real requests to a ONE-TIME-USE endpoint. The first
  // would succeed and consume the token; the second would then correctly
  // fail (token already used), and since it resolves after the first,
  // its failure would be what actually ends up on screen — a real user's
  // verification would silently succeed on the server while the page told
  // them it failed. hasRun persists across StrictMode's double-mount
  // (a ref survives remounts within the same effect cycle), so only the
  // first invocation ever calls the API.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!token) {
      setStatus("error");
      setErrorMessage("This verification link is missing its token.");
      return;
    }
    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.response?.data?.error || "This verification link is invalid or has expired.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm text-center">
        {status === "verifying" && <p className="text-slate-400">Verifying your email…</p>}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-semibold text-slate-800">Email verified</h1>
            <p className="mt-2 text-sm text-slate-500">Your email address has been confirmed.</p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-md bg-slate-800 text-white px-4 py-2 font-medium hover:bg-slate-700 transition-colors"
            >
              Sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-semibold text-slate-800">Verification failed</h1>
            <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
            <Link to="/resend-verification" className="mt-4 inline-block text-sm text-sky-600 hover:underline">
              Request a new verification link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
