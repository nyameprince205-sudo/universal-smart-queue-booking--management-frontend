import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../../api/passwordReset";
function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState(null);
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    if (!token) {
      setStatus("error");
      setErrorMessage("This verification link is missing its token.");
      return;
    }
    verifyEmail(token).then(() => setStatus("success")).catch(err => {
      setStatus("error");
      setErrorMessage(err.response?.data?.error || "This verification link is invalid or has expired.");
    });
  }, [token]);
  return <div className="min-h-screen flex items-center justify-center bg-warm-bg surface-texture-subtle px-4">
      <div className="w-full max-w-sm text-center">
        {status === "verifying" && <p className="text-slate-400">Verifying your email…</p>}

        {status === "success" && <>
            <h1 className="text-2xl font-semibold text-slate-800">Email verified</h1>
            <p className="mt-2 text-sm text-slate-500">Your email address has been confirmed.</p>
            <Link to="/login" className="mt-6 inline-block rounded-md bg-slate-800 text-white px-4 py-2 font-medium hover:bg-slate-700 transition-colors">
              Sign in
            </Link>
          </>}

        {status === "error" && <>
            <h1 className="text-2xl font-semibold text-slate-800">Verification failed</h1>
            <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
            <Link to="/resend-verification" className="mt-4 inline-block text-sm text-sky-600 hover:underline">
              Request a new verification link
            </Link>
          </>}
      </div>
    </div>;
}
export default VerifyEmailPage;