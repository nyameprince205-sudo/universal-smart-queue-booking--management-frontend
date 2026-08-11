import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchOrganizations } from "../../api/publicOrg";
import Navbar from "../../components/Navbar";

// Module 3: the piece that lets a customer FIND a business — a hospital, a
// bank, a salon — by name, from inside the app itself, rather than needing
// an already-shared /book/:slug link to get anywhere. Public: no login
// required to browse, same as the booking page itself once you get there.
//
// Phase 17, Step 2 addition: reads an initial ?search= from the URL, so the
// homepage's own hero search box can hand off to this page's real search
// logic instead of re-implementing it — one search implementation, two
// entry points.
function OrganizationSearchPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const runSearch = useCallback(async (term) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchOrganizations(term);
      setOrganizations(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load organizations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(searchParams.get("search") || "");
    // Only re-run when the URL's own search param changes (e.g. arriving
    // fresh from the homepage's hero search) — NOT on every keystroke in
    // the input below, which is handled by the form submit instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("search")]);

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(search);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-slate-800 text-center">Find a Business</h1>
          <p className="mt-1 text-sm text-slate-500 text-center">Search for a restaurant, hospital, salon, and more.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <button
              type="submit"
              className="rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors"
            >
              Search
            </button>
          </form>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {loading && <p className="mt-8 text-slate-400 text-center">Loading…</p>}

          {/* Phase 17, Step 2: a genuine empty result now points somewhere
              real — the registration request form — rather than just
              saying "nothing found" and leaving the person stuck. */}
          {!loading && organizations.length === 0 && !error && (
            <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6 text-center">
              <p className="text-slate-500">Can't find your organization?</p>
              <Link
                to="/request-registration"
                className="mt-3 inline-block rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors"
              >
                Request Organization Registration
              </Link>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {organizations.map((org) => (
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
        </div>
      </div>
    </div>
  );
}

export default OrganizationSearchPage;
