import { useEffect, useState } from "react";
import { listMyCustomers } from "../../api/customers";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  blacklisted: "bg-red-100 text-red-700",
};

// Answers a real gap: an Org Admin previously had no way to see who their
// business has actually served — whether that customer created a real
// account (self-registered) or was only ever quick-registered by staff
// during check-in / booked as a guest. Reuses the customer_organizations
// relationship your app already builds on every booking and check-in;
// nothing new is written here, only read back.
function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listMyCustomers()
      .then(setCustomers)
      .catch((err) => setError(err.response?.data?.error || "Couldn't load customers."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-800">Customers</h1>
      <p className="mt-1 text-sm text-slate-500">Everyone who has booked with or joined a queue at your business.</p>

      {error && <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <p className="mt-8 text-slate-400">Loading…</p>}
      {!loading && customers.length === 0 && !error && <p className="mt-8 text-slate-400">No customers yet.</p>}

      {!loading && customers.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Account</th>
                <th className="px-4 py-3 font-medium">Bookings</th>
                <th className="px-4 py-3 font-medium">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.customerId}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.relationshipStatus] || "bg-slate-100 text-slate-500"}`}>
                      {c.relationshipStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <p>{c.phone}</p>
                    {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                  </td>
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
  );
}

export default CustomersPage;
