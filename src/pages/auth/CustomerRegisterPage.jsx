import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  UserRound,
  Phone,
  Mail,
  LockKeyhole,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function CustomerRegisterPage() {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Accept only Ghanaian phone numbers in these formats:
  // 0241234567    -> 10 digits
  // +233241234567 -> +233 followed by 9 digits
  function handlePhoneChange(e) {
    const value = e.target.value;

    // Allow users to clear the field.
    if (value === "") {
      setPhone("");
      return;
    }

    // International format: +233 followed by 9 digits.
    if (value.startsWith("+")) {
      const digits = value.slice(1).replace(/\D/g, "");

      // Only allow the Ghana country code.
      if (!digits.startsWith("233")) {
        return;
      }

      // +233 plus a maximum of 9 additional digits.
      const limitedDigits = digits.slice(0, 12);
      setPhone(`+${limitedDigits}`);
      return;
    }

    // Local format: digits only, maximum 10 digits.
    const digits = value.replace(/\D/g, "").slice(0, 10);

    // Local numbers must start with 0.
    if (digits.length > 0 && !digits.startsWith("0")) {
      return;
    }

    setPhone(digits);
  }

  function isValidGhanaPhone(value) {
    return /^(0\d{9}|\+233\d{9})$/.test(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!isValidGhanaPhone(trimmedPhone)) {
      setError(
        "Enter a valid Ghanaian phone number: 10 digits starting with 0, or +233 followed by 9 digits."
      );
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      await registerCustomer(
        trimmedName,
        trimmedPhone,
        trimmedEmail || null,
        password
      );

      const requestedPath = location.state?.from?.pathname;
      const destination =
        requestedPath && requestedPath !== "/customer/register"
          ? requestedPath
          : "/";

      navigate(destination, { replace: true });
    } catch (err) {
      if (err.response?.status === 409) {
        setError(
          "An account with this phone number already exists. Try signing in instead."
        );
      } else {
        setError(
          err.response?.data?.error ||
            "We couldn't create your account. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

  const phoneIsValid = isValidGhanaPhone(phone);

  return (
    <div className="surface-texture-subtle relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-bg px-4 py-10 sm:px-6">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Brand / heading */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
            <UserPlus size={29} strokeWidth={1.8} />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
            Welcome aboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Register once to book services, join queues, and keep track of your
            bookings.
          </p>
        </div>

        {/* Registration card */}
        <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Phone number */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="phone"
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
                  aria-describedby="phone-help"
                  className={inputClass}
                  disabled={submitting}
                />
              </div>

              <p
                id="phone-help"
                className="mt-1.5 text-xs text-slate-500"
              >
                Enter 10 digits starting with 0, or +233 followed by 9 digits.
              </p>

              {phone.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className={
                      phoneIsValid ? "text-emerald-600" : "text-slate-300"
                    }
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

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <span className="text-xs text-slate-400">8+ characters</span>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-20`}
                  disabled={submitting}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1 py-1 text-xs font-semibold text-sky-700 hover:text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className={
                      password.length >= 8
                        ? "text-emerald-600"
                        : "text-slate-300"
                    }
                  />
                  <span
                    className={`text-xs ${
                      password.length >= 8
                        ? "text-emerald-700"
                        : "text-slate-500"
                    }`}
                  >
                    {password.length >= 8
                      ? "Minimum password length met"
                      : `${8 - password.length} more characters needed`}
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-600/15 transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating your account...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create account
                  <ArrowRight size={17} className="ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">Already registered?</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <Link
            to="/customer/login"
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
          <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
          <span>Your account details are handled securely.</span>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          By creating an account, you can manage your bookings in one place.
        </p>
      </div>
    </div>
  );
}

export default CustomerRegisterPage;

