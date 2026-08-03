import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPublicOrganization } from "../../api/publicOrg";
import { createMyBooking } from "../../api/myBookings";

function BookingForm({ org }) {
  const [branchId, setBranchId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // A service can belong to one specific branch, or (branchId: null) be
  // available at every branch — see service.controller.js. So once a
  // branch is picked, only show services that are actually offered there.
  const availableServices = org.services.filter((s) => !s.branchId || s.branchId === branchId);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const booking = await createMyBooking({
        organizationId: org.id,
        branchId,
        serviceId,
        bookingDate,
        bookingTime,
        partySize: Number(partySize),
        notes: notes || undefined,
      });
      setConfirmedBooking(booking);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't create this booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedBooking) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 px-4 py-4 text-center">
        <p className="font-medium text-green-800">Booking confirmed!</p>
        <p className="text-sm text-green-700 mt-1">
          {bookingDate} at {bookingTime}
        </p>
        <Link to="/my-bookings" className="mt-3 inline-block text-sm text-sky-600 hover:underline">
          View my bookings
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Branch</label>
        <select
          required
          value={branchId}
          onChange={(e) => {
            setBranchId(e.target.value);
            setServiceId(""); // the previously picked service may not be offered at the new branch
          }}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        >
          <option value="">Select a branch…</option>
          {org.branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Service</label>
        <select
          required
          disabled={!branchId}
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 disabled:bg-slate-50"
        >
          <option value="">{branchId ? "Select a service…" : "Pick a branch first"}</option>
          {availableServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.price ? `— GHS ${s.price}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            required
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Time</label>
          <input
            type="time"
            required
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Party size <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="number"
          min="1"
          value={partySize}
          onChange={(e) => setPartySize(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-sky-600 text-white py-2 font-medium hover:bg-sky-500 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Booking…" : "Confirm Booking"}
      </button>
    </form>
  );
}

function OrgBookingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { isAuthenticated, authType } = useAuth();

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getPublicOrganization(slug)
      .then(setOrg)
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Not found</h1>
          <p className="mt-2 text-slate-500">This business doesn't have a booking page at this link.</p>
          <Link to="/" className="mt-4 inline-block text-sky-600 hover:underline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  // Anyone can see WHAT there is to book — only submitting the booking
  // itself requires being logged in as a customer. Someone who isn't
  // logged in (or is logged in as staff/admin on this same browser — a
  // real scenario if an org admin is previewing their own booking page)
  // gets a clear prompt, and lands right back HERE after they log in.
  const canBook = isAuthenticated && authType === "customer";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800">{org.name}</h1>

        <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
          {canBook ? (
            <BookingForm org={org} />
          ) : (
            <div className="text-center">
              <p className="text-slate-600">Sign in to book a service at {org.name}.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/customer/login"
                  state={{ from: location }}
                  className="rounded-md bg-sky-600 text-white py-2 font-medium hover:bg-sky-500 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/customer/register"
                  state={{ from: location }}
                  className="rounded-md border border-slate-300 text-slate-700 py-2 font-medium hover:bg-slate-50 transition-colors"
                >
                  Create an account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrgBookingPage;
