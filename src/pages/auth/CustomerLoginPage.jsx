import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
function CustomerLoginPage() {
  const {
    loginCustomer
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginCustomer(phone, password);
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, {
        replace: true
      });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
  return <div className="min-h-screen flex items-center justify-center bg-warm-bg surface-texture-subtle px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-800 text-center">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500 text-center">Sign in to book a service or check your queue.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>}

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input id="phone" type="tel" required autoComplete="tel" placeholder="+233201234567" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link to="/customer/forgot-password" className="text-sm text-sky-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input id="password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-md bg-sky-600 text-white py-2 font-medium hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/customer/register" className="text-sky-600 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Staff or admin?{" "}
          <Link to="/login" className="text-sky-600 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>;
}
export default CustomerLoginPage;