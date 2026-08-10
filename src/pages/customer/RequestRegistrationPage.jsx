import { useState } from "react";
import { Link } from "react-router-dom";
import { submitOrganizationRequest } from "../../api/organizationRequests";

// Phase 17, Step 1. Public — no login exists for a business that isn't on
// the platform yet, same reasoning as guest booking having no auth
// requirement. This deliberately does NOT create an organization or a
// login on submit — see the backend delivery notes for why: a Super Admin
// reviews this, then provisions the org through the existing, already-
// working Create Organization flow, rather than a second path that could
// drift from it.
function RequestRegistrationPage() {
  const [form, setForm] = useState({
    businessName: "", ownerName: "", businessType: "", phone: "", email: "",
    address: "", city: "", region: "", numberOfBranches: "", additionalNotes: "",
  });
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
      await submitOrganizationRequest(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Request received</h1>
          <p className="mt-3 text-slate-600">
            Thanks — our team will review your request and reach out at {form.email} or {form.phone}.
          </p>
          <Link to="/" className="mt-6 inline-block text-sky-600 hover:underline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800">Request Organization Registration</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell us about your business, and we'll reach out to get you set up.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700">Business name</label>
            <input required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Owner name</label>
            <input required value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Business type</label>
            <input required placeholder="e.g. Restaurant, Salon, Clinic" value={form.businessType} onChange={(e) => update("businessType", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone number</label>
              <input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Address <span className="text-slate-400 font-normal">(optional)</span></label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">City <span className="text-slate-400 font-normal">(optional)</span></label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Region <span className="text-slate-400 font-normal">(optional)</span></label>
              <input value={form.region} onChange={(e) => update("region", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Number of branches <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" min="1" value={form.numberOfBranches} onChange={(e) => update("numberOfBranches", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Additional notes <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={3} value={form.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-md bg-sky-600 text-white py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50 transition-colors">
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestRegistrationPage;
