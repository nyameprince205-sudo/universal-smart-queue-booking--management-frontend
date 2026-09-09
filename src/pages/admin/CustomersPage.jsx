import { useEffect, useState } from "react";
import { listMyCustomers } from "../../api/customers";
const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  blacklisted: "bg-red-100 text-red-700"
};
function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    listMyCustomers().then(setCustomers).catch(err => setError(err.response?.data?.error || "Couldn't load customers.")).finally(() => setLoading(false));
  }, []);
  return <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Customers</h1>
      <p className="mt-1 text-sm text-slate-500">Everyone who has booked with or joined a queue at your business.</p>

      {error && <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <p className="mt-8 text-slate-400">Loading…</p>}
      {!loading && customers.length === 0 && !error && <p className="mt-8 text-slate-400">No customers yet.</p>}

      
      {!loading && customers.length > 0 && <div className="mt-6 sm:hidden space-y-3">
          {customers.map(c => <div key={c.customerId} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.phone}</p>
                  {c.email && <p className="text-xs text-slate-400 break-all">{c.email}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-semibold text-slate-800 leading-none">{c.totalBookings}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {c.totalBookings === 1 ? "booking" : "bookings"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.relationshipStatus] || "bg-slate-100 text-slate-500"}`}>
                  {c.relationshipStatus}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.hasAccount ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                  {c.hasAccount ? "Registered" : "Guest"}
                </span>
                <span className="text-xs text-slate-400">
                  Last seen {new Date(c.lastInteractionAt).toLocaleDateString()}
                </span>
              </div>
            </div>)}
        </div>}

      {!loading && customers.length > 0 && <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden hidden sm:block">
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
              {customers.map(c => <tr key={c.customerId}>
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
                </tr>)}
            </tbody>
          </table>
        </div>}
    </div>;
}
export default CustomersPage;