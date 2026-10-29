import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle2,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Headset,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { submitContactForm } from "../../api/contact";
import useDocumentTitle from "../../hooks/useDocumentTitle";

function ContactPage() {
  useDocumentTitle("Contact Us");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await submitContactForm(form);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition duration-200 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10";

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f7f2] text-stone-800">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative border-b border-stone-200/80 bg-[#142c24]">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:36px_36px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-200">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                We're here to help
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Let's talk about
                <span className="block text-amber-300">
                  making waiting easier.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg sm:leading-8">
                Have a question about bookings, queue management, or bringing
                your organization onto our platform? Send us a message. We'd
                be happy to hear from you.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-stone-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-300"
                    aria-hidden="true"
                  />
                  Business enquiries
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-300"
                    aria-hidden="true"
                  />
                  Platform support
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-300"
                    aria-hidden="true"
                  />
                  Partnership opportunities
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 hidden h-1.5 w-1/3 bg-amber-300 sm:block" />
        </section>

        {/* Contact content */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
            {/* Contact information */}
            <aside>
              <div className="max-w-lg">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-800">
                  Get in touch
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                  We'd love to hear from you.
                </h2>

                <p className="mt-4 leading-7 text-stone-600">
                  Choose whichever contact method works best for you, or use
                  the message form and tell us how we can help.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <a
                  href="mailto:klonflexsolutions@gmail.com"
                  className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-800 group-hover:text-white">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-500">
                      Email us
                    </p>
                    <p className="mt-1 break-all font-semibold text-stone-900">
                      klonflexsolutions@gmail.com
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      Send us your questions or enquiries.
                    </p>
                  </div>

                  <ArrowRight
                    className="mt-1 h-4 w-4 shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-800"
                    aria-hidden="true"
                  />
                </a>

                <a
                  href="tel:+233533116300"
                  className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition group-hover:bg-amber-400 group-hover:text-stone-900">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-500">
                      Phone / WhatsApp
                    </p>
                    <p className="mt-1 font-semibold text-stone-900">
                      +233 533 116 300
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      Contact us directly for assistance.
                    </p>
                  </div>

                  <ArrowRight
                    className="mt-1 h-4 w-4 shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-800"
                    aria-hidden="true"
                  />
                </a>

                <div className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-stone-500">
                      Location
                    </p>
                    <p className="mt-1 font-semibold text-stone-900">
                      Accra, Ghana
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      Serving businesses and customers across Ghana.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-900/10 bg-emerald-50/80 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm">
                    <Headset className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-emerald-950">
                      Need help with the platform?
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-emerald-900/75">
                      Include a clear description of your issue in the form.
                      If it relates to a booking or queue, explain what
                      happened so we can understand your enquiry.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Contact form */}
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_20px_60px_-30px_rgba(20,44,36,0.22)]">
              <div className="border-b border-stone-100 bg-stone-50/70 px-6 py-6 sm:px-8 sm:py-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#173b2e] text-amber-300">
                    <Send className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">
                      Send us a message
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      Complete the form below and we'll get back to you using
                      the email address you provide.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {submitted ? (
                  <div
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center sm:px-8"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2
                        className="h-9 w-9"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-5 text-2xl font-bold text-emerald-950">
                      Message sent successfully!
                    </h3>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-emerald-900/80">
                      Thank you for contacting us. Your message has been
                      submitted, and we'll get back to you at{" "}
                      <strong className="break-all">{form.email}</strong>.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          name: "",
                          email: "",
                          phone: "",
                          subject: "",
                          message: "",
                        });
                        setSubmitted(false);
                        setError(null);
                      }}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b2e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/20"
                    >
                      Send another message
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div
                        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        role="alert"
                      >
                        <span className="font-semibold">Error:</span>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-sm font-semibold text-stone-700"
                        >
                          Full name <span className="text-red-600">*</span>
                        </label>

                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          maxLength={100}
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Enter your full name"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-sm font-semibold text-stone-700"
                        >
                          Email address{" "}
                          <span className="text-red-600">*</span>
                        </label>

                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="you@example.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-sm font-semibold text-stone-700"
                      >
                        Phone number{" "}
                        <span className="font-normal text-stone-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        maxLength={30}
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+233 XX XXX XXXX"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-sm font-semibold text-stone-700"
                      >
                        Subject{" "}
                        <span className="font-normal text-stone-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        maxLength={150}
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        placeholder="What is your enquiry about?"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-sm font-semibold text-stone-700"
                      >
                        Your message{" "}
                        <span className="text-red-600">*</span>
                      </label>

                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        minLength={5}
                        maxLength={5000}
                        rows={5}
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        placeholder="Tell us how we can help..."
                        className={`${inputClass} min-h-36 resize-y`}
                      />

                      <p className="mt-2 text-right text-xs text-stone-400">
                        {form.message.length}/5000 characters
                      </p>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-stone-50 px-4 py-3">
                      <ShieldCheck
                        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800"
                        aria-hidden="true"
                      />
                      <p className="text-xs leading-5 text-stone-500">
                        Please avoid including passwords, payment card
                        details, or other sensitive information in your
                        message.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#173b2e] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            aria-hidden="true"
                          />
                          Sending your message...
                        </>
                      ) : (
                        <>
                          <Send
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs leading-5 text-stone-400">
                      Fields marked with <span className="text-red-600">*</span>{" "}
                      are required.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Closing note */}
          <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Clock3 className="h-5 w-5" aria-hidden="true" />
              </div>

              <div>
                <h3 className="font-bold text-stone-900">
                  Every good solution starts with a conversation.
                </h3>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Tell us what your business needs. Let's explore how smarter
                  queue and booking management can help.
                </p>
              </div>
            </div>

            <a
              href="mailto:klonflexsolutions@gmail.com"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-800 hover:text-emerald-800 sm:self-center"
            >
              Email us directly
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ContactPage;

