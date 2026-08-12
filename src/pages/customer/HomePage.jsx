import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { searchOrganizations } from "../../api/publicOrg";
import { listMyBookings } from "../../api/myBookings";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatBookingTime } from "../../utils/formatBookingTime";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  checked_in: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
  no_show: "bg-red-100 text-red-700",
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

  useEffect(() => {
    listMyBookings()
      .then((data) => setBookings(data.slice(0, 5))) // newest 5 — listMyBookings already sorts newest-first
      .catch(() => setBookings([]));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Welcome back, {profile?.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">Your recent bookings</p>
          </div>
          <Link to="/my-bookings" className="text-sm text-sky-600 hover:underline shrink-0">
            View all bookings
          </Link>
        </div>

        {bookings === null && <p className="mt-4 text-sm text-slate-400">Loading…</p>}
        {bookings?.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">No bookings yet — search for a business below to make your first one.</p>
        )}
        {bookings && bookings.length > 0 && (
          <div className="mt-4 space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{b.organization?.name}</p>
                  <p className="text-xs text-slate-500">
                    {b.service?.name} · {new Date(b.bookingDate).toLocaleDateString()} at {formatBookingTime(b.bookingTime)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[b.status] || "bg-slate-100 text-slate-500"}`}>
                  {b.status.replace("_", " ")}
                </span>
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {isLoggedInCustomer && <RecentBookings profile={profile} />}

      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
          Find an Organization and Join a Queue or Book a Service in Minutes.
        </h1>
        <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
          Search for a restaurant, hospital, salon, or any business on the platform — no account needed to
          browse, book, or join a queue.
        </p>

        <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Search by business name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-md bg-sky-600 text-white px-5 py-3 text-sm font-medium hover:bg-sky-500 transition-colors"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>

        <div className="mt-16 text-left">
          <p className="text-sm font-medium text-slate-500 mb-4">Popular Organizations</p>
          {loadingPopular && <p className="text-slate-400 text-sm">Loading…</p>}
          {!loadingPopular && popularOrgs.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
              <p className="text-slate-500">Can't find your organization?</p>
              <Link
                to="/request-registration"
                className="mt-3 inline-block rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors"
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
                  className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-sky-300 transition-colors"
                >
                  <p className="font-medium text-slate-800">{org.name}</p>
                  <p className="text-sm text-slate-500">{org.businessType?.name}</p>
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
