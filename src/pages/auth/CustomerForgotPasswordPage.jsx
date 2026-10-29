import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Phone,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { requestCustomerPasswordReset } from "../../api/passwordReset";

function CustomerForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Local: 0241234567 (10 digits)
  // International: +233241234567 (13 characters)
  function handlePhoneChange(event) {
    const value = event.target.value;

    if (value === "") {
      setPhone("");
      setError(null);
      return;
    }

    if (value.startsWith("+")) {
      const digits = value.slice(1).replace(/\D/g, "");

      // Only allow the Ghana country code.
      if (!digits.startsWith("233")) {
        return;
      }

      // +233 followed by a maximum of 9 digits.
      setPhone(`+${digits.slice(0, 12)}`);
      setError(null);
      return;
    }

    // Local numbers: digits only, maximum 10.
    const digits = value.replace(/\D/g, "").slice(0, 10);

    // Local numbers must start with 0.
    if (digits.length > 0 && !digits.startsWith("0")) {
      return;
    }

    setPhone(digits);
    setError(null);
  }

  function isValidGhanaPhone(value) {
    return /^(0\d{9}|\+233\d{9})$/.test(value);
  }

  const phoneIsValid = isValidGhanaPhone(phone);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setError(null);

    const trimmedPhone = phone.trim();

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

    setSubmitting(true);

    try {
      await requestCustomerPasswordReset(trimmedPhone);
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

  return (
    <main className="surface-texture-subtle relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-bg px-4 py-10">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl"
      />

      <section className="relative w-full max-w-md">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {submitted ? "Check your next steps" : "Forgot your password?"}
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
            {submitted
              ? "Your request has been processed. Follow the instructions if your account is registered with this number."
              : "It happens. Enter your registered phone number to request a password reset link."}
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                <CheckCircle2 size={28} aria-hidden="true" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Request submitted
              </h2>

              <p
                role="status"
                className="mt-2 text-sm leading-6 text-slate-600"
              >
                If an account exists with that phone number, a password reset
                link has been sent. Please check the instructions you receive.
              </p>

              <div className="mt-5 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-left">
                <p className="text-sm leading-6 text-sky-800">
                  For your security, this confirmation does not reveal whether
                  an account exists with that phone number.
                </p>
              </div>

              <Link
                to="/customer/login"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-600/20"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Reset your password
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Enter the phone number linked to your customer account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700"
                  >
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <p>{error}</p>
                  </div>
                )}

                {/* Phone number */}
                <div>
                  <label
                    htmlFor="customer-reset-phone"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Phone number
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />

                    <input
                      id="customer-reset-phone"
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
                      aria-describedby="customer-reset-phone-help"
                      disabled={submitting}
                      className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </div>

                  <p
                    id="customer-reset-phone-help"
                    className="mt-1.5 text-xs leading-5 text-slate-500"
                  >
                    Enter 10 digits starting with 0, or +233 followed by 9
                    digits.
                  </p>

                  {phone.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className={
                          phoneIsValid
                            ? "text-emerald-600"
                            : "text-slate-300"
                        }
                        aria-hidden="true"
                      />

                      <span
                        className={`text-xs ${
                          phoneIsValid
                            ? "text-emerald-700"
                            : "text-slate-500"
                        }`}
                      >
                        {phoneIsValid
                          ? "Phone number format is valid"
                          : "Complete the phone number"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !phone.trim()}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                      Sending request...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-xs text-slate-400">REMEMBERED IT?</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <Link
                to="/customer/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to sign in
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Protect your account by keeping your password and reset link private.
          <br />
          Need to book a service? You can sign in after recovering your account.
        </p>
      </section>
    </main>
  );
}

export default CustomerForgotPasswordPage;

