import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import Navbar from "../../components/Navbar";
import { submitContactForm } from "../../api/contact";

// Phase 17, Step 4 — the form itself, completing what Step 2 deliberately
// left as "coming soon." Same public, no-login pattern as every other
// public submission in this app (registration requests, guest bookings).
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitContactForm(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-800">Contact Us</h1>
        <p className="mt-2 text-slate-500">Have a question or need help? Reach us directly, or send a message below.</p>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-start gap-3">
            <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-medium text-slate-800">support@queuesaas.example.com</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-start gap-3">
            <Phone className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-400">Phone / WhatsApp</p>
              <p className="font-medium text-slate-800">+233 20 000 0000</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-start gap-3 sm:col-span-2">
            <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-400">Office</p>
              <p className="font-medium text-slate-800">Accra, Ghana</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
          <p className="font-medium text-slate-800 mb-4">Send us a message</p>

          {submitted ? (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-4 text-center">
              <p className="font-medium text-green-800">Message sent!</p>
              <p className="text-sm text-green-700 mt-1">We'll get back to you at {form.email} soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Phone <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Subject <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-sky-600 text-white py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
