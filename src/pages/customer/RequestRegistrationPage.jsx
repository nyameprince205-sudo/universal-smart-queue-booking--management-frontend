import { useState } from "react";
import { Link } from "react-router-dom";
import { submitOrganizationRequest } from "../../api/organizationRequests";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import Navbar from "../../components/Navbar";
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
    additionalNotes: ""
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  function update(field, value) {
    setForm(f => ({
      ...f,
      [field]: value
    }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitOrganizationRequest(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
  if (submitted) {
    return <div className="min-h-screen bg-warm-bg surface-texture-subtle font-sans">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="max-w-md text-center" role="status">
            <h1 className="font-display text-2xl font-semibold text-warm-ink">Request received</h1>
            <p className="mt-3 text-warm-muted-2">
              Thanks — our team will review your request and reach out at {form.email} or {form.phone}.
            </p>
            <Link to="/" className="mt-6 inline-block text-forest-600 hover:underline">
              Back home
            </Link>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-warm-bg font-sans">
      <Navbar />
      <div className="py-10 px-4">
        <main className="max-w-lg mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-forest-600 hover:underline mb-4">
            ← Back to Home
          </Link>
          <h1 className="font-display text-2xl font-semibold text-warm-ink">Request Organization Registration</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell us about your business, and we'll reach out to get you set up.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700" role="alert">{error}</div>}

          <div>
            <label htmlFor="req-business-name" className="block text-sm font-medium text-slate-700">Business name</label>
            <input id="req-business-name" required value={form.businessName} onChange={e => update("businessName", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div>
            <label htmlFor="req-owner-name" className="block text-sm font-medium text-slate-700">Owner name</label>
            <input id="req-owner-name" required value={form.ownerName} onChange={e => update("ownerName", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div>
            <label htmlFor="req-business-type" className="block text-sm font-medium text-slate-700">Business type</label>
            <input id="req-business-type" required placeholder="e.g. Restaurant, Salon, Clinic" value={form.businessType} onChange={e => update("businessType", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="req-phone" className="block text-sm font-medium text-slate-700">Phone number</label>
              <input id="req-phone" required type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            </div>
            <div>
              <label htmlFor="req-email" className="block text-sm font-medium text-slate-700">Email</label>
              <input id="req-email" required type="email" value={form.email} onChange={e => update("email", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            </div>
          </div>
          <div>
            <label htmlFor="req-address" className="block text-sm font-medium text-slate-700">Address <span className="text-slate-400 font-normal">(optional)</span></label>
            <input id="req-address" value={form.address} onChange={e => update("address", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="req-city" className="block text-sm font-medium text-slate-700">City <span className="text-slate-400 font-normal">(optional)</span></label>
              <input id="req-city" value={form.city} onChange={e => update("city", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            </div>
            <div>
              <label htmlFor="req-region" className="block text-sm font-medium text-slate-700">Region <span className="text-slate-400 font-normal">(optional)</span></label>
              <input id="req-region" value={form.region} onChange={e => update("region", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            </div>
          </div>
          <div>
            <label htmlFor="req-branches" className="block text-sm font-medium text-slate-700">Number of branches <span className="text-slate-400 font-normal">(optional)</span></label>
            <input id="req-branches" type="number" min="1" value={form.numberOfBranches} onChange={e => update("numberOfBranches", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div>
            <label htmlFor="req-notes" className="block text-sm font-medium text-slate-700">Additional notes <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea id="req-notes" rows={3} value={form.additionalNotes} onChange={e => update("additionalNotes", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-md bg-forest-600 text-white py-2 text-sm font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors">
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>
        </main>
      </div>
    </div>;
}
export default RequestRegistrationPage;