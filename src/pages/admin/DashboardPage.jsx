import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboardSummary } from "../../api/reports";
import DateRangePicker from "../../components/DateRangePicker";
import StatCard from "../../components/StatCard";
import { formatDuration } from "../../utils/formatDuration";

// Display labels for the raw status strings the backend uses (see
// report.controller.js's BOOKING_STATUSES) — kept here rather than in the
// API layer, since "how a status reads to a human" is a presentation
// concern, not something the backend needs to know about.
const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No-Show",
};

function DashboardPage() {
  const [filters, setFilters] = useState(null); // set by DateRangePicker on first render
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSummary = useCallback(async (rangeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary(rangeFilters);
      setSummary(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load the dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filters) loadSummary(filters);
  }, [filters, loadSummary]);

  function handleRangeChange(newFilters) {
    setFilters(newFilters);
  }

  const chartData = summary
    ? Object.entries(summary.bookings.byStatus).map(([status, count]) => ({
        status: STATUS_LABELS[status] || status,
        count,
      }))
    : [];

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <DateRangePicker onChange={handleRangeChange} />
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !summary && <p className="mt-8 text-slate-400">Loading…</p>}

      {summary && (
        <>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Bookings" value={summary.bookings.total} />
            <StatCard label="Tickets Served" value={summary.queue.ticketsServed} />
            <StatCard
              label="Avg Wait Time"
              value={formatDuration(summary.queue.averageWaitTimeSeconds)}
              hint={summary.queue.averageWaitTimeSeconds == null ? "No completed tickets in range" : undefined}
            />
            <StatCard
              label="No-Show Rate"
              value={`${summary.noShowRatePercent}%`}
              hint={
                summary.noShowRatePercent >= 20
                  ? "Higher than typical — worth a look"
                  : undefined
              }
            />
          </div>

          <div className="mt-6 bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500 mb-4">Bookings by Status</p>
            {summary.bookings.total === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">No bookings in this date range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            {summary.range.startDate} to {summary.range.endDate}
          </p>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
