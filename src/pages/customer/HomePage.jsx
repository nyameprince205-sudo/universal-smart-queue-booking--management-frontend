import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { searchOrganizations } from "../../api/publicOrg";
import Navbar from "../../components/Navbar";

// Phase 17, Step 2. The old version of this page just oriented a signed-in
// customer toward "My Bookings" — this is the real public homepage now,
// per the spec's "PRIMARY GOAL: help customers quickly search for an
// organization." The search input here doesn't duplicate any search
// logic — it just navigates to the ALREADY-WORKING /organizations page
// with the term pre-filled, reusing that page's real search entirely.
function HomePage() {
  const navigate = useNavigate();
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
