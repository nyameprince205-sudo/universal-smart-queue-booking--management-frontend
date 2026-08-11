import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Phone, MessageCircle, Globe, Link2, AtSign, Clock, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getPublicOrganization } from "../../api/publicOrg";
import { createMyBooking, createGuestBooking } from "../../api/myBookings";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// Shared by both the logged-in and guest booking paths — same branch/
// service/date/time/party-size/notes fields either way. `onSubmit` is
// what differs (createMyBooking vs createGuestBooking), and for the guest
// path there are three extra fields (name/phone/email) since there's no
// JWT to read an identity from.
function BookingForm({ org, isGuest, onSubmit }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
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
      const basePayload = {
        organizationId: org.id,
        branchId,
        serviceId,
        bookingDate,
        bookingTime,
        partySize: Number(partySize),
        notes: notes || undefined,
      };
      const payload = isGuest ? { ...basePayload, customerName, customerPhone, customerEmail: customerEmail || undefined } : basePayload;
      const booking = await onSubmit(payload);
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
        {isGuest ? (
          <p className="mt-3 text-xs text-green-700">
            Want to track this booking, see your history, and book faster next time?{" "}
            <Link to="/customer/register" className="underline">
              Create a free account
            </Link>{" "}
            with the same phone number to link it.
          </p>
        ) : (
          <Link to="/my-bookings" className="mt-3 inline-block text-sm text-sky-600 hover:underline">
            View my bookings
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {isGuest && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700">Your name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone number</label>
            <input
              type="tel"
              required
              placeholder="+233201234567"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
            />
          </div>
          <hr className="border-slate-200" />
        </>
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

// Phase 17, Step 3: everything below is new. Only rendered for fields that
// actually have a value — an org that hasn't filled in WhatsApp yet simply
// doesn't show a WhatsApp button, rather than a dead/broken one.
function OrgProfile({ org }) {
  const hasAnyContact = org.phone || org.whatsapp || org.website || org.facebook || org.instagram;

  return (
    <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        {org.logoUrl && (
          <img src={org.logoUrl} alt={`${org.name} logo`} className="w-14 h-14 rounded-md object-cover border border-slate-200" />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{org.name}</h1>
          {org.description && <p className="mt-1 text-sm text-slate-500">{org.description}</p>}
        </div>
      </div>

      {org.openingHours && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" /> {org.openingHours}
        </p>
      )}

      {hasAnyContact && (
        <div className="mt-4 flex flex-wrap gap-2">
          {org.phone && (
            <a
              href={`tel:${org.phone}`}
              className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          )}
          {org.whatsapp && (
            <a
              href={`https://wa.me/${org.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm text-green-700 hover:bg-green-200 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
          {org.website && (
            <a
              href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" /> Website
            </a>
          )}
          {org.facebook && (
            <a
              href={org.facebook.startsWith("http") ? org.facebook : `https://${org.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" /> Facebook
            </a>
          )}
          {org.instagram && (
            <a
              href={`https://instagram.com/${org.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <AtSign className="w-3.5 h-3.5" /> Instagram
            </a>
          )}
        </div>
      )}

      {/* Branches — address/phone already existed per-branch in the
          schema; Get Directions is a Google Maps search built from that
          address, no geocoding needed. */}
      {org.branches.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Branches</p>
          <div className="space-y-2">
            {org.branches.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-700 font-medium">{b.name}</p>
                  {b.address && <p className="text-slate-500">{b.address}</p>}
                </div>
                {b.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-600 hover:underline shrink-0 ml-3"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Directions
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrgBookingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { isAuthenticated, authType } = useAuth();

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  useDocumentTitle(org ? `Book ${org.name}` : "Book a Service");

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

  // Task 4: booking works WITHOUT an account by default — a logged-in
  // customer books as themselves (createMyBooking, no name/phone fields
  // needed since the JWT already identifies them); anyone else books as a
  // guest (createGuestBooking, which asks for name/phone/email since
  // there's nothing else to identify them by). Signing in is offered as an
  // upgrade alongside the guest form, not a gate in front of it — Task 4 is
  // explicit that creating an account must stay optional.
  const isLoggedInCustomer = isAuthenticated && authType === "customer";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Phase 17, Step 3: the profile section now carries the org name
            and description — the old bare <h1>{org.name}</h1> that used to
            sit here is gone, folded into OrgProfile instead. */}
        <OrgProfile org={org} />

        {!isLoggedInCustomer && (
          <p className="mt-4 text-sm text-slate-500">
            Booking as a guest below.{" "}
            <Link to="/customer/login" state={{ from: location }} className="text-sky-600 hover:underline">
              Sign in
            </Link>{" "}
            for faster future bookings and to track your history.
          </p>
        )}

        <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
          {isLoggedInCustomer ? (
            <BookingForm org={org} isGuest={false} onSubmit={createMyBooking} />
          ) : (
            <BookingForm org={org} isGuest={true} onSubmit={createGuestBooking} />
          )}
        </div>
      </div>
    </div>
  );
}

export default OrgBookingPage;
