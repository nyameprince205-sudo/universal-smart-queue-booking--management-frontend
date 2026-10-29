import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  Users,
} from "lucide-react";
import { submitOrganizationRequest } from "../../api/organizationRequests";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

function RequestRegistrationPage() {
  useDocumentTitle("Request Organization Registration");

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    businessType: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    region: "",
    numberOfBranches: "",
    additionalNotes: "",
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // Accept Ghanaian local or international phone formats.
  function handlePhoneChange(e) {
    const value = e.target.value;

    if (value === "") {
      update("phone", "");
      setError(null);
      return;
    }

    if (value.startsWith("+")) {
      const digits = value.slice(1).replace(/\D/g, "");

      if (!digits.startsWith("233")) {
        return;
      }

      update("phone", `+${digits.slice(0, 12)}`);
      setError(null);
      return;
    }

    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length > 0 && !digits.startsWith("0")) {
      return;
    }

    update("phone", digits);
    setError(null);
  }

  function isValidGhanaPhone(phone) {
    return /^(0\d{9}|\+233\d{9})$/.test(phone);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const phone = form.phone.trim();

    if (!isValidGhanaPhone(phone)) {
      setError(
        "Enter a valid Ghanaian phone number: 0241234567 or +233241234567."
      );
      return;
    }

    setSubmitting(true);

    try {
      await submitOrganizationRequest(form);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't submit your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#DDE3DC] bg-white px-4 py-3 text-sm text-[#202923] outline-none transition-all placeholder:text-[#9AA39B] focus:border-[#47745A] focus:ring-4 focus:ring-[#47745A]/10";

  const labelClass = "block text-sm font-semibold text-[#344239]";

  const optionalLabel = (
    <span className="ml-1 font-normal text-[#929A92]">
      (optional)
    </span>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] font-sans">
        <Navbar />

        <main className="relative isolate flex min-h-[65vh] items-center justify-center overflow-hidden px-4 py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DDE9DE]/60 blur-3xl"
          />

          <div
            className="w-full max-w-lg rounded-3xl border border-[#E3E9E1] bg-white p-7 text-center shadow-[0_12px_40px_rgba(25,50,32,0.07)] sm:p-10"
            role="status"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E6F4EA] text-[#28583D]">
              <CheckCircle2 size={42} strokeWidth={1.8} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#47745A]">
              Submission successful
            </p>

            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#202923]">
              Request received!
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#68736B]">
              Thank you for your interest in joining our platform.
              Our team will review your request and reach out using
              the contact details you provided.
            </p>

            <div className="mt-7 space-y-3 rounded-2xl border border-[#E6EAE4] bg-[#F7F8F5] p-4 text-left">
              <div className="flex items-start gap-3">
                <Building2
                  size={18}
                  className="mt-0.5 shrink-0 text-[#47745A]"
                />
                <div className="min-w-0">
                  <p className="text-xs text-[#68736B]">
                    Business name
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-[#202923]">
                    {form.businessName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-[#47745A]"
                />
                <div className="min-w-0">
                  <p className="text-xs text-[#68736B]">
                    Contact phone
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-[#202923]">
                    {form.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquareText
                  size={18}
                  className="mt-0.5 shrink-0 text-[#47745A]"
                />
                <div className="min-w-0">
                  <p className="text-xs text-[#68736B]">
                    Contact email
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-[#202923]">
                    {form.email}
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/"
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#103B2B] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#154D38] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47745A] focus-visible:ring-offset-2 sm:w-auto"
            >
              Back to Home
              <ArrowRight size={17} />
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F5] font-sans">
      <Navbar />

      {/* Page hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#151C19] via-[#1C2923] to-[#26372D] px-4 py-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/[0.06] sm:h-96 sm:w-96"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-[#D9AB3F]/[0.05] blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium text-[#E8D5A4] sm:text-sm">
            <Building2 size={15} />
            Join our organization directory
          </span>

          <h1 className="mt-6 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Bring Your Business
            <span className="mt-2 block text-[#E0B957]">
              Closer to Your Customers.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
            Make it easier for customers to discover your business,
            request appointments, and manage their waiting time.
            Tell us about your organization to get started.
          </p>
        </div>
      </section>

      {/* Registration form area */}
      <main className="relative isolate overflow-hidden px-4 py-10 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[38rem] max-w-full -translate-x-1/2 rounded-full bg-[#DDE9DE]/40 blur-3xl"
        />

        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#47745A] transition-colors hover:text-[#103B2B] focus-visible:outline-none focus-visible:underline"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="overflow-hidden rounded-3xl border border-[#E3E9E1] bg-white shadow-[0_12px_40px_rgba(25,50,32,0.06)]">
            {/* Form heading */}
            <div className="border-b border-[#E9EDE7] px-5 py-7 sm:px-8 sm:py-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4EA] text-[#28583D]">
                  <ClipboardList size={25} />
                </div>

                <div>
                  <h2 className="font-display text-xl font-semibold text-[#202923] sm:text-2xl">
                    Organization registration request
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#68736B]">
                    Complete the form below. Our team will contact you
                    to discuss the next steps.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-8 p-5 sm:p-8"
            >
              {/* Error message */}
              {error && (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  role="alert"
                >
                  <p className="font-semibold">
                    We couldn't submit your request
                  </p>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              {/* Business information */}
              <section aria-labelledby="business-information-heading">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F5F0] text-[#28583D]">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <h3
                      id="business-information-heading"
                      className="text-base font-semibold text-[#202923]"
                    >
                      Business information
                    </h3>
                    <p className="mt-1 text-xs text-[#7B857C]">
                      Tell us about your organization.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="req-business-name"
                      className={labelClass}
                    >
                      Business name
                    </label>
                    <input
                      id="req-business-name"
                      name="businessName"
                      autoComplete="organization"
                      required
                      value={form.businessName}
                      onChange={(e) =>
                        update("businessName", e.target.value)
                      }
                      placeholder="e.g. ABK Pharmacy"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="req-owner-name"
                        className={labelClass}
                      >
                        Owner or contact name
                      </label>
                      <input
                        id="req-owner-name"
                        name="ownerName"
                        autoComplete="name"
                        required
                        value={form.ownerName}
                        onChange={(e) =>
                          update("ownerName", e.target.value)
                        }
                        placeholder="Full name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="req-business-type"
                        className={labelClass}
                      >
                        Business type
                      </label>
                      <input
                        id="req-business-type"
                        name="businessType"
                        required
                        value={form.businessType}
                        onChange={(e) =>
                          update("businessType", e.target.value)
                        }
                        placeholder="e.g. Pharmacy, Salon, Clinic"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact information */}
              <section
                aria-labelledby="contact-information-heading"
                className="border-t border-[#E9EDE7] pt-7"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F5F0] text-[#28583D]">
                    <Phone size={19} />
                  </div>

                  <div>
                    <h3
                      id="contact-information-heading"
                      className="text-base font-semibold text-[#202923]"
                    >
                      Contact information
                    </h3>
                    <p className="mt-1 text-xs text-[#7B857C]">
                      How should our team reach you?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="req-phone"
                      className={labelClass}
                    >
                      Phone number
                    </label>
                    <input
                      id="req-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={13}
                      required
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder="0241234567 or +233241234567"
                      aria-describedby="req-phone-hint"
                      className={inputClass}
                    />
                    <p
                      id="req-phone-hint"
                      className="mt-2 text-xs leading-5 text-[#7B857C]"
                    >
                      Enter 10 digits starting with 0, or +233
                      followed by 9 digits.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="req-email"
                      className={labelClass}
                    >
                      Email address
                    </label>
                    <input
                      id="req-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        update("email", e.target.value)
                      }
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Location information */}
              <section
                aria-labelledby="location-information-heading"
                className="border-t border-[#E9EDE7] pt-7"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F5F0] text-[#28583D]">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h3
                      id="location-information-heading"
                      className="text-base font-semibold text-[#202923]"
                    >
                      Business location
                    </h3>
                    <p className="mt-1 text-xs text-[#7B857C]">
                      Help customers identify your business.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="req-address"
                      className={labelClass}
                    >
                      Street address {optionalLabel}
                    </label>
                    <input
                      id="req-address"
                      name="address"
                      autoComplete="street-address"
                      value={form.address}
                      onChange={(e) =>
                        update("address", e.target.value)
                      }
                      placeholder="Street, area, or landmark"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="req-city"
                        className={labelClass}
                      >
                        City or town {optionalLabel}
                      </label>
                      <input
                        id="req-city"
                        name="city"
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={(e) =>
                          update("city", e.target.value)
                        }
                        placeholder="e.g. Accra"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="req-region"
                        className={labelClass}
                      >
                        Region {optionalLabel}
                      </label>
                      <input
                        id="req-region"
                        name="region"
                        autoComplete="address-level1"
                        value={form.region}
                        onChange={(e) =>
                          update("region", e.target.value)
                        }
                        placeholder="e.g. Greater Accra"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Additional details */}
              <section
                aria-labelledby="additional-details-heading"
                className="border-t border-[#E9EDE7] pt-7"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F5F0] text-[#28583D]">
                    <Users size={19} />
                  </div>

                  <div>
                    <h3
                      id="additional-details-heading"
                      className="text-base font-semibold text-[#202923]"
                    >
                      Additional details
                    </h3>
                    <p className="mt-1 text-xs text-[#7B857C]">
                      Share any other information that may help.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="req-branches"
                      className={labelClass}
                    >
                      Number of branches {optionalLabel}
                    </label>
                    <input
                      id="req-branches"
                      name="numberOfBranches"
                      type="number"
                      min="1"
                      step="1"
                      value={form.numberOfBranches}
                      onChange={(e) =>
                        update("numberOfBranches", e.target.value)
                      }
                      placeholder="e.g. 1"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="req-notes"
                      className={labelClass}
                    >
                      Additional notes {optionalLabel}
                    </label>
                    <textarea
                      id="req-notes"
                      name="additionalNotes"
                      rows={4}
                      value={form.additionalNotes}
                      onChange={(e) =>
                        update("additionalNotes", e.target.value)
                      }
                      placeholder="Tell us about your services, preferred setup, or any questions..."
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>
              </section>

              {/* Submission */}
              <div className="border-t border-[#E9EDE7] pt-7">
                <p className="mb-5 text-xs leading-6 text-[#7B857C]">
                  By submitting this form, you are asking our team
                  to review your organization for registration.
                  Submission does not automatically create or
                  approve an account.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#103B2B] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#154D38] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47745A] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      />
                      Submitting request...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Submit Registration Request
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-[#7B857C]">
                  Already looking for a business?{" "}
                  <Link
                    to="/"
                    className="font-semibold text-[#28583D] hover:underline"
                  >
                    Explore organizations
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default RequestRegistrationPage;

