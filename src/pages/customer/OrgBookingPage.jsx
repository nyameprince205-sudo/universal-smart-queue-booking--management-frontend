import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Phone, MessageCircle, Globe, Link2, AtSign, Clock, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getPublicOrganization } from "../../api/publicOrg";
import { createMyBooking, createGuestBooking } from "../../api/myBookings";
import useDocumentTitle from "../../hooks/useDocumentTitle";
function BookingForm({
  org,
  isGuest,
  onSubmit
}) {
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
  const availableServices = org.services.filter(s => !s.branchId || s.branchId === branchId);
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
        notes: notes || undefined
      };
      const payload = isGuest ? {
        ...basePayload,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined
      } : basePayload;
      const booking = await onSubmit(payload);
      setConfirmedBooking(booking);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't create this booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
  if (confirmedBooking) {
    const isWaitlisted = confirmedBooking.status === "waitlisted";
    const position = confirmedBooking.waitlistPosition;
    if (isWaitlisted) {
      return <div className="rounded-md border border-purple-200 bg-purple-50 px-4 py-4">
          <p className="font-medium text-purple-900 text-center">This time is fully booked</p>

          <p className="text-sm text-purple-800 mt-2 text-center">
            {bookingDate} at {bookingTime}
          </p>

          <div className="mt-3 rounded-md bg-white border border-purple-200 px-3 py-3">
            <p className="text-sm text-purple-900 font-medium">
              You've been added to the waitlist
              {position ? ` — you're number ${position} in line` : ""}
            </p>
            <p className="text-sm text-purple-800 mt-1.5 leading-relaxed">
              All places at this time are taken. If someone ahead of you cancels, your
              booking is confirmed automatically and we'll message you straight away on
              the phone number and email you gave.
            </p>
            <p className="text-sm text-purple-800 mt-1.5 leading-relaxed">
              You don't need to do anything to stay on the list.
            </p>
          </div>

          <div className="mt-3 rounded-md bg-white border border-purple-200 px-3 py-3">
            <p className="text-xs font-medium text-purple-900 uppercase tracking-wide">
              Prefer not to wait?
            </p>
            <ul className="mt-1.5 text-sm text-purple-800 space-y-1">
              <li>· Book a different time or date — most other slots are still open</li>
              <li>· Try another branch if this business has more than one</li>
              <li>· Cancel your place on the waitlist at any time</li>
            </ul>
          </div>

          {isGuest ? <p className="mt-3 text-xs text-purple-800 text-center">
              <Link to="/customer/register" className="underline">
                Create a free account
              </Link>{" "}
              with the same phone number to track your place and cancel it yourself.
            </p> : <div className="mt-3 flex gap-3 justify-center">
              <Link to="/my-bookings" className="text-sm text-purple-900 underline">
                View or cancel this booking
              </Link>
            </div>}
        </div>;
    }
    return <div className="rounded-md bg-green-50 border border-green-200 px-4 py-4 text-center">
        <p className="font-medium text-green-800">Booking confirmed!</p>
        <p className="text-sm text-green-700 mt-1">
          {bookingDate} at {bookingTime}
        </p>
        {isGuest ? <p className="mt-3 text-xs text-green-700">
            Want to track this booking, see your history, and book faster next time?{" "}
            <Link to="/customer/register" className="underline">
              Create a free account
            </Link>{" "}
            with the same phone number to link it.
          </p> : <Link to="/my-bookings" className="mt-3 inline-block text-sm text-sky-600 hover:underline">
            View my bookings
          </Link>}
      </div>;
  }
  return <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      {isGuest && <>
          <div>
            <label className="block text-sm font-medium text-slate-700">Your name</label>
            <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone number</label>
            <input type="tel" required placeholder="+233201234567" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800" />
          </div>
          <hr className="border-slate-200" />
        </>}

      <div>
        <label className="block text-sm font-medium text-slate-700">Branch</label>
        <select required value={branchId} onChange={e => {
        setBranchId(e.target.value);
        setServiceId("");
      }} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800">
          <option value="">Select a branch…</option>
          {org.branches.map(b => <option key={b.id} value={b.id}>
              {b.name}
            </option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Service</label>
        <select required disabled={!branchId} value={serviceId} onChange={e => setServiceId(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 disabled:bg-slate-50">
          <option value="">{branchId ? "Select a service…" : "Pick a branch first"}</option>
          {availableServices.map(s => <option key={s.id} value={s.id}>
              {s.name} {s.price ? `— GHS ${s.price}` : ""}
            </option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Time</label>
          <input type="time" required value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Party size <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input type="number" min="1" value={partySize} onChange={e => setPartySize(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800" />
      </div>

      <button type="submit" disabled={submitting} className="w-full rounded-md bg-sky-600 text-white py-2 font-medium hover:bg-sky-500 disabled:opacity-50 transition-colors">
        {submitting ? "Booking…" : "Confirm Booking"}
      </button>
    </form>;
}
function OrgProfile({
  org
}) {
  const hasAnyContact = org.phone || org.whatsapp || org.website || org.facebook || org.instagram;
  return <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        {org.logoUrl && <img src={org.logoUrl} alt={`${org.name} logo`} className="w-14 h-14 rounded-md object-cover border border-slate-200" />}
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{org.name}</h1>
          {org.description && <p className="mt-1 text-sm text-slate-500">{org.description}</p>}
        </div>
      </div>

      {org.openingHours && <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" /> {org.openingHours}
        </p>}

      {hasAnyContact && <div className="mt-4 flex flex-wrap gap-2">
          {org.phone && <a href={`tel:${org.phone}`} className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors">
              <Phone className="w-3.5 h-3.5" /> Call
            </a>}
          {org.whatsapp && <a href={`https://wa.me/${org.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm text-green-700 hover:bg-green-200 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>}
          {org.website && <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors">
              <Globe className="w-3.5 h-3.5" /> Website
            </a>}
          {org.facebook && <a href={org.facebook.startsWith("http") ? org.facebook : `https://${org.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors">
              <Link2 className="w-3.5 h-3.5" /> Facebook
            </a>}
          {org.instagram && <a href={`https://instagram.com/${org.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors">
              <AtSign className="w-3.5 h-3.5" /> Instagram
            </a>}
        </div>}

      
      {org.branches.length > 0 && <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Branches</p>
          <div className="space-y-2">
            {org.branches.map(b => <div key={b.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-700 font-medium">{b.name}</p>
                  {b.address && <p className="text-slate-500">{b.address}</p>}
                </div>
                {b.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-600 hover:underline shrink-0 ml-3">
                    <MapPin className="w-3.5 h-3.5" /> Directions
                  </a>}
              </div>)}
          </div>
        </div>}
    </div>;
}
function OrgBookingPage() {
  const {
    slug
  } = useParams();
  const location = useLocation();
  const {
    isAuthenticated,
    authType
  } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  useDocumentTitle(org ? `Book ${org.name}` : "Book a Service");
  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getPublicOrganization(slug).then(setOrg).catch(err => {
      if (err.response?.status === 404) setNotFound(true);
    }).finally(() => setLoading(false));
  }, [slug]);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Loading…</p>
      </div>;
  }
  if (notFound) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Not found</h1>
          <p className="mt-2 text-slate-500">This business doesn't have a booking page at this link.</p>
          <Link to="/" className="mt-4 inline-block text-sky-600 hover:underline">
            Back home
          </Link>
        </div>
      </div>;
  }
  const isLoggedInCustomer = isAuthenticated && authType === "customer";
  return <div className="min-h-screen bg-warm-bg py-10 px-4">
      <div className="max-w-md mx-auto">
        
        <OrgProfile org={org} />

        {!isLoggedInCustomer && <p className="mt-4 text-sm text-slate-500">
            Booking as a guest below.{" "}
            <Link to="/customer/login" state={{
          from: location
        }} className="text-sky-600 hover:underline">
              Sign in
            </Link>{" "}
            for faster future bookings and to track your history.
          </p>}

        <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
          {isLoggedInCustomer ? <BookingForm org={org} isGuest={false} onSubmit={createMyBooking} /> : <BookingForm org={org} isGuest={true} onSubmit={createGuestBooking} />}
        </div>
      </div>
    </div>;
}
export default OrgBookingPage;