import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { searchOrganizations } from "../../api/publicOrg";
import { listMyBookings } from "../../api/myBookings";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useCustomerBookingUpdates from "../../hooks/useCustomerBookingUpdates";
import { formatBookingTime } from "../../utils/formatBookingTime";

// Redesign: each booking's status now reads as a small ticket stub — dark
// ink background, notched sides, gold label — the same motif as the live
// queue ticket display, since a booking IS the same underlying idea (a
// place in line for something) even before it becomes an actual queue
// ticket at check-in. Status colors below carry that same warm palette
// instead of the old default blue/indigo/green.
const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

// Real gap, found after the fact: this page's Phase 17 redesign made it a
// pure public hero/search page and dropped the auth-aware "Welcome back"
// section the OLD homepage had — a logged-in customer landing here saw the
// exact same thing a guest would, no sign they were even logged in, no
// quick way to see what they'd already booked. This restores that,
// WITHOUT touching the public hero/search experience below it, which
// keeps working identically for guests and logged-out visitors.
function RecentBookings({ profile }) {
  const [bookings, setBookings] = useState(null);

  const load = useCallback(() => {
    listMyBookings()
      .then((data) => setBookings(data.slice(0, 5))) // newest 5 — listMyBookings already sorts newest-first
      .catch(() => setBookings([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Same live-update hook MyBookingsPage uses — a booking's status
  // changing while someone's sitting on the homepage now updates here
  // too, not just on the dedicated bookings page.
  useCustomerBookingUpdates(load);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10">
      <div className="bg-warm-card rounded-lg border border-warm-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-warm-ink">Welcome back, {profile?.name}</h2>
            <p className="text-sm text-warm-muted mt-0.5">Your recent bookings</p>
          </div>
          <Link to="/my-bookings" className="text-sm text-forest-600 hover:underline shrink-0">
            View all bookings
          </Link>
        </div>

        {bookings === null && <p className="mt-4 text-sm text-warm-muted">Loading…</p>}
        {bookings?.length === 0 && (
          <p className="mt-4 text-sm text-warm-muted">No bookings yet — search for a business below to make your first one.</p>
        )}
        {bookings && bookings.length > 0 && (
          <div className="mt-4 space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-t border-warm-border pt-3 first:border-t-0 first:pt-0">
                <div>
                  <p className="text-sm font-medium text-warm-ink">{b.organization?.name}</p>
                  <p className="text-xs text-warm-muted mt-0.5">
                    {b.service?.name} · {new Date(b.bookingDate).toLocaleDateString()} at {formatBookingTime(b.bookingTime)}
                  </p>
                </div>
                {/* Ticket-stub status badge — the signature motif */}
                <div className="relative bg-warm-ink rounded-md px-3 py-1.5 shrink-0 ml-3">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-warm-bg rounded-full" />
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-warm-bg rounded-full" />
                  <p className="font-display text-xs font-semibold text-gold-600 whitespace-nowrap">
                    {STATUS_LABELS[b.status] || b.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Phase 17, Step 2. The old version of this page just oriented a signed-in
// customer toward "My Bookings" — this is the real public homepage now,
// per the spec's "PRIMARY GOAL: help customers quickly search for an
// organization." The search input here doesn't duplicate any search
// logic — it just navigates to the ALREADY-WORKING /organizations page
// with the term pre-filled, reusing that page's real search entirely.
//
// Redesign: forest green + gold on the warm background, Fraunces carrying
// the hero heading specifically — the one moment on this page meant to
// feel like a real brand, not just a working tool.
function HomePage() {
  useDocumentTitle("Find a Business Near You");
  const navigate = useNavigate();
  const { isAuthenticated, authType, profile } = useAuth();
  const isLoggedInCustomer = isAuthenticated && authType === "customer";
  const [searchTerm, setSearchTerm] = useState("");
  const [popularOrgs, setPopularOrgs] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    searchOrganizations("")
      .then((data) => setPopularOrgs(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoadingPopular(false));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/organizations?search=${encodeURIComponent(searchTerm.trim())}` : "/organizations");
  }

  return (
    <div className="min-h-screen bg-warm-bg font-sans">
      <Navbar />

      {isLoggedInCustomer && <RecentBookings profile={profile} />}

      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-warm-ink leading-tight">
          Find an Organization and Join a Queue or Book a Service in Minutes.
        </h1>
        <p className="mt-4 text-warm-muted-2 max-w-2xl mx-auto">
          Search for a restaurant, hospital, salon, or any business on the platform — no account needed to
          browse, book, or join a queue.
        </p>

        <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Search by business name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-warm-border px-4 py-3 text-warm-ink bg-warm-card focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-forest-400"
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-md bg-forest-600 text-white px-5 py-3 text-sm font-medium hover:bg-forest-700 transition-colors"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>

        <div className="mt-16 text-left">
          <p className="text-sm font-medium text-warm-muted mb-4">Popular Organizations</p>
          {loadingPopular && <p className="text-warm-muted text-sm">Loading…</p>}
          {!loadingPopular && popularOrgs.length === 0 && (
            <div className="bg-warm-card rounded-lg border border-warm-border p-6 text-center">
              <p className="text-warm-muted-2">Can't find your organization?</p>
              <Link
                to="/request-registration"
                className="mt-3 inline-block rounded-md bg-forest-600 text-white px-4 py-2 text-sm font-medium hover:bg-forest-700 transition-colors"
              >
                Request Organization Registration
              </Link>
            </div>
          )}
          {!loadingPopular && popularOrgs.length > 0 && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {popularOrgs.map((org) => (
                <Link
                  key={org.id}
                  to={`/book/${org.slug}`}
                  className="block bg-warm-card rounded-lg border border-warm-border p-4 hover:border-forest-400 transition-colors"
                >
                  <p className="font-medium text-warm-ink">{org.name}</p>
                  <p className="text-sm text-warm-muted">{org.businessType?.name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
