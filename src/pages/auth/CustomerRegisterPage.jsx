import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
function CustomerRegisterPage() {
  const {
    registerCustomer
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerCustomer(name, phone, email || null, password);
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, {
        replace: true
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setError("An account with this phone number already exists. Try signing in instead.");
      } else {
        setError(err.response?.data?.error || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }
  return <div className="min-h-screen flex items-center justify-center bg-warm-bg surface-texture-subtle px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-800 text-center">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500 text-center">Book services and join queues in seconds.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input id="name" type="text" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input id="phone" type="tel" required autoComplete="tel" placeholder="+233201234567" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-md bg-sky-600 text-white py-2 font-medium hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/customer/login" className="text-sky-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>;
}
export default CustomerRegisterPage;