import { useEffect, useState, useCallback } from "react";
import { getExecutiveSummary } from "../../api/analytics";
import StatCard from "../../components/StatCard";
import { formatDuration } from "../../utils/formatDuration";

// Module 7: deliberately no date range picker anywhere on this page — this
// is a "what's happening right now" view (live queues, who's currently
// serving), not a historical report. Polls every 30s rather than wiring
// into Socket.IO — a genuinely live-second-by-second feed would need new
// broadcast events across the whole org (every branch, not just one),
// which is real added complexity an executive summary doesn't need;
// "refreshes automatically every half minute" is close enough for a
// dashboard someone glances at, not a live queue board a customer stares at.
const REFRESH_INTERVAL_MS = 30000;

function ExecutiveDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getExecutiveSummary();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load the executive summary.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl">
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold text-slate-800">Executive Dashboard</h1>
        <p className="text-xs text-slate-400">
          Updated {new Date(summary.generatedAt).toLocaleTimeString()} · refreshes automatically
        </p>
      </div>

      {summary.alerts.length > 0 && (
        <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-medium text-red-800">
            {summary.alerts.length} branch{summary.alerts.length > 1 ? "es" : ""} need attention
          </p>
          <ul className="mt-1 space-y-1">
            {summary.alerts.map((a) => (
              <li key={a.branchId} className="text-sm text-red-700">
                <span className="font-medium">{a.branchName}:</span> {a.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-sm font-medium text-slate-500">Live Right Now</p>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Customers Waiting" value={summary.live.customersWaiting} />
        <StatCard label="Being Served" value={summary.live.customersServing} />
        <StatCard label="Active Staff" value={summary.live.activeStaffCount} />
        <StatCard label="Open Counters" value={summary.live.activeCounters} />
      </div>

      <p className="mt-6 text-sm font-medium text-slate-500">Today</p>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Completed" value={summary.today.customersCompleted} />
        <StatCard label="Avg Wait" value={formatDuration(summary.today.averageWaitTimeSeconds)} />
        <StatCard label="Avg Service" value={formatDuration(summary.today.averageServiceTimeSeconds)} />
        <StatCard label="Revenue" value={`GHS ${summary.today.revenue.toFixed(2)}`} />
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <p className="text-sm font-medium text-slate-500 px-5 pt-5 pb-3">Branch Ranking (today)</p>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-2 font-medium">Branch</th>
                <th className="px-5 py-2 font-medium">Waiting</th>
                <th className="px-5 py-2 font-medium">Served</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.branchRanking.map((b) => (
                <tr key={b.branchId} className={b.overloaded ? "bg-red-50" : ""}>
                  <td className="px-5 py-2 font-medium text-slate-800">{b.branchName}</td>
                  <td className="px-5 py-2 text-slate-600">{b.customersWaiting}</td>
                  <td className="px-5 py-2 text-slate-600">{b.ticketsServedToday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <p className="text-sm font-medium text-slate-500 px-5 pt-5 pb-3">Service Ranking (today)</p>
          {summary.serviceRanking.length === 0 ? (
            <p className="text-sm text-slate-400 px-5 pb-5">No completed bookings yet today.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Service</th>
                  <th className="px-5 py-2 font-medium">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.serviceRanking.map((s) => (
                  <tr key={s.serviceId}>
                    <td className="px-5 py-2 font-medium text-slate-800">{s.serviceName}</td>
                    <td className="px-5 py-2 text-slate-600">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExecutiveDashboardPage;
