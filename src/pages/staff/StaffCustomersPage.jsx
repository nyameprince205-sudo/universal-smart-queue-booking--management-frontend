import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";
import { listMyCustomers } from "../../api/customers";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  blacklisted: "bg-red-100 text-red-700",
};

// Real gap this fixes: front-desk/hostess staff had no way to look up a
// customer's own name and phone number themselves — only an Org Admin
// could see the Customers list (under /admin, which STAFF accounts can't
// reach at all). If someone called in with a complaint or a question,
// staff had to escalate to a manager just to confirm who the person was.
// This reuses the exact same backend data an Org Admin sees (now opened
// up to STAFF too — see customer.routes.js), just in a standalone page
// since staff don't have the admin sidebar around them, with a quick
// search since finding ONE specific person fast is the actual use case
// here, not browsing the full list.
function StaffCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listMyCustomers()
      .then(setCustomers)
      .catch((err) => setError(err.response?.data?.error || "Couldn't load customers."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) => c.name?.toLowerCase().includes(term) || c.phone?.replace(/\s/g, "").includes(term.replace(/\s/g, ""))
    );
  }, [customers, search]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">
            <Link to="/staff/queue" className="text-sky-600 hover:underline">
              Back to Queue Console
            </Link>
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="max-w-3xl mx-auto mt-6">
        <input
          type="text"
          placeholder="Search by name or phone number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />

        {error && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {loading && <p className="mt-6 text-slate-400">Loading…</p>}
        {!loading && filtered.length === 0 && !error && (
          <p className="mt-6 text-slate-400">{search ? "No matching customer found." : "No customers yet."}</p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-4 bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Bookings</th>
                  <th className="px-4 py-3 font-medium">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.customerId}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{c.name}</p>
                      <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.relationshipStatus] || "bg-slate-100 text-slate-500"}`}>
                        {c.relationshipStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{c.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.hasAccount ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                        {c.hasAccount ? "Registered" : "Guest"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.totalBookings}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(c.lastInteractionAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffCustomersPage;
