import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { searchOrganizations } from "../../api/publicOrg";

// Module 3: the piece that lets a customer FIND a business — a hospital, a
// bank, a salon — by name, from inside the app itself, rather than needing
// an already-shared /book/:slug link to get anywhere. Public: no login
// required to browse, same as the booking page itself once you get there.
function OrganizationSearchPage() {
  const [search, setSearch] = useState("");
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

  // Load the full (unfiltered) list immediately on first visit — a
  // customer shouldn't have to type something before seeing anything at
  // all, same reasoning as the guest booking form defaulting to visible
  // rather than gated.
  useEffect(() => {
    runSearch("");
  }, [runSearch]);

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(search);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
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

        {!loading && organizations.length === 0 && !error && (
          <p className="mt-8 text-slate-400 text-center">No businesses found.</p>
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
  );
}

export default OrganizationSearchPage;
