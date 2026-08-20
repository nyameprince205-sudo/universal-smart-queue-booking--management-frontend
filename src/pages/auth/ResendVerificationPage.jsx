import { useState } from "react";
import { Link } from "react-router-dom";
import { resendVerification } from "../../api/passwordReset";
function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resendVerification(email);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  }
  return <div className="min-h-screen flex items-center justify-center bg-warm-bg surface-texture-subtle px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-800 text-center">Resend Verification Email</h1>
        <p className="mt-1 text-sm text-slate-500 text-center">
          Enter your email and we'll resend the verification link if needed.
        </p>

        {submitted ? <div className="mt-8 rounded-md bg-sky-50 border border-sky-200 px-4 py-4 text-center">
            <p className="text-sm text-sky-800">
              If an account exists and needs verification, a new verification email has been sent.
            </p>
            <Link to="/login" className="mt-3 inline-block text-sm text-sky-600 hover:underline">
              Back to sign in
            </Link>
          </div> : <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <button type="submit" disabled={submitting} className="w-full rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors">
              {submitting ? "Sending…" : "Resend verification email"}
            </button>
            <p className="text-center text-sm text-slate-500">
              <Link to="/login" className="text-sky-600 hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>}
      </div>
    </div>;
}
export default ResendVerificationPage;