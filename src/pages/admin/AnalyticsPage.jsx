import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  getServicePopularity, getPeakHours, getBookingTrends, getStaffPerformance, getBranchComparison, getRevenueReport,
} from "../../api/analytics";
import DateRangePicker from "../../components/DateRangePicker";
import StatCard from "../../components/StatCard";
import { formatDuration } from "../../utils/formatDuration";

const TABS = ["Overview", "Trends", "Staff & Branches", "Revenue"];
const GRANULARITIES = ["day", "week", "month", "year"];

// ---- Overview: peak hours + service popularity ----
function OverviewTab({ filters }) {
  const [peakHours, setPeakHours] = useState(null);
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filters) return;
    setLoading(true);
    setError(null);
    Promise.all([getPeakHours(filters), getServicePopularity(filters)])
      .then(([hoursData, servicesData]) => {
        setPeakHours(hoursData);
        setServices(servicesData);
      })
      .catch((err) => setError(err.response?.data?.error || "Couldn't load this data."))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <p className="mt-8 text-slate-400">Loading…</p>;
  if (error) return <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>;
  if (!peakHours || !services) return null;

  const mostPopular = services.services.slice(0, 5);
  const leastPopular = services.services.slice(-5).reverse();

  return (
    <div className="mt-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <p className="text-sm font-medium text-slate-500 mb-4">Peak Hours (ticket volume by hour of day)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={peakHours.byHour}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#64748b" }} interval={1} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip labelFormatter={(h) => `${h}:00`} />
            <Bar dataKey="ticketCount" fill="#0284c7" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-3">Most Requested Services</p>
          {mostPopular.length === 0 ? (
            <p className="text-sm text-slate-400">No bookings in this range.</p>
          ) : (
            <ul className="space-y-2">
              {mostPopular.map((s) => (
                <li key={s.serviceId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{s.serviceName}</span>
                  <span className="font-medium text-slate-800">{s.bookingCount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-3">Least Requested Services</p>
          {leastPopular.length === 0 ? (
            <p className="text-sm text-slate-400">No bookings in this range.</p>
          ) : (
            <ul className="space-y-2">
              {leastPopular.map((s) => (
                <li key={s.serviceId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{s.serviceName}</span>
                  <span className="font-medium text-slate-800">{s.bookingCount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Trends: bookings at day/week/month/year granularity ----
function TrendsTab({ filters }) {
  const [granularity, setGranularity] = useState("week");
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filters) return;
    setLoading(true);
    setError(null);
    getBookingTrends({ ...filters, granularity })
      .then(setTrend)
      .catch((err) => setError(err.response?.data?.error || "Couldn't load trends."))
      .finally(() => setLoading(false));
  }, [filters, granularity]);

  return (
    <div className="mt-6">
      <div className="flex gap-2 mb-4">
        {GRANULARITIES.map((g) => (
          <button
            key={g}
            onClick={() => setGranularity(g)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              granularity === g ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {g}ly
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-400">Loading…</p>}
      {error && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {trend && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          {trend.trend.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No bookings in this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Staff & Branches: two comparison tables ----
function StaffBranchesTab({ filters }) {
  const [staff, setStaff] = useState(null);
  const [branches, setBranches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filters) return;
    setLoading(true);
    setError(null);
    Promise.all([getStaffPerformance(filters), getBranchComparison(filters)])
      .then(([staffData, branchData]) => {
        setStaff(staffData);
        setBranches(branchData);
      })
      .catch((err) => setError(err.response?.data?.error || "Couldn't load this data."))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <p className="mt-8 text-slate-400">Loading…</p>;
  if (error) return <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>;
  if (!staff || !branches) return null;

  return (
    <div className="mt-6 space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <p className="text-sm font-medium text-slate-500 px-5 pt-5 pb-3">Staff Performance</p>
        {staff.staff.length === 0 ? (
          <p className="text-sm text-slate-400 px-5 pb-5">
            No data yet — this needs tickets called after the staff-attribution update shipped.
          </p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-2 font-medium">Staff</th>
                <th className="px-5 py-2 font-medium">Handled</th>
                <th className="px-5 py-2 font-medium">Completed</th>
                <th className="px-5 py-2 font-medium">Missed</th>
                <th className="px-5 py-2 font-medium">Avg Service Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.staff.map((s) => (
                <tr key={s.userId}>
                  <td className="px-5 py-2 font-medium text-slate-800">{s.name}</td>
                  <td className="px-5 py-2 text-slate-600">{s.ticketsHandled}</td>
                  <td className="px-5 py-2 text-slate-600">{s.completed}</td>
                  <td className="px-5 py-2 text-slate-600">{s.missed}</td>
                  <td className="px-5 py-2 text-slate-600">{formatDuration(s.averageServiceTimeSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <p className="text-sm font-medium text-slate-500 px-5 pt-5 pb-3">Branch Comparison</p>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-2 font-medium">Branch</th>
              <th className="px-5 py-2 font-medium">Bookings</th>
              <th className="px-5 py-2 font-medium">Tickets Served</th>
              <th className="px-5 py-2 font-medium">Avg Wait</th>
              <th className="px-5 py-2 font-medium">No-Show Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {branches.branches.map((b) => (
              <tr key={b.branchId}>
                <td className="px-5 py-2 font-medium text-slate-800">{b.branchName}</td>
                <td className="px-5 py-2 text-slate-600">{b.totalBookings}</td>
                <td className="px-5 py-2 text-slate-600">{b.ticketsServed}</td>
                <td className="px-5 py-2 text-slate-600">{formatDuration(b.averageWaitTimeSeconds)}</td>
                <td className="px-5 py-2 text-slate-600">{b.noShowRatePercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Revenue ----
function RevenueTab({ filters }) {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filters) return;
    setLoading(true);
    setError(null);
    getRevenueReport(filters)
      .then(setRevenue)
      .catch((err) => setError(err.response?.data?.error || "Couldn't load revenue."))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <p className="mt-8 text-slate-400">Loading…</p>;
  if (error) return <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>;
  if (!revenue) return null;

  return (
    <div className="mt-6 space-y-6">
      <StatCard label="Total Revenue" value={`GHS ${revenue.totalRevenue.toFixed(2)}`} />

      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <p className="text-sm font-medium text-slate-500 mb-4">Revenue by Service</p>
        {revenue.byService.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No completed bookings with revenue in this range.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue.byService}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="serviceName" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip formatter={(v) => `GHS ${v}`} />
              <Bar dataKey="revenue" fill="#16a34a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {revenue.byDay.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-4">Revenue by Day</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenue.byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip formatter={(v) => `GHS ${v}`} />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [filters, setFilters] = useState(null);

  const handleRangeChange = useCallback((newFilters) => setFilters(newFilters), []);

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">Analytics</h1>
        <DateRangePicker onChange={handleRangeChange} />
      </div>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && <OverviewTab filters={filters} />}
      {activeTab === "Trends" && <TrendsTab filters={filters} />}
      {activeTab === "Staff & Branches" && <StaffBranchesTab filters={filters} />}
      {activeTab === "Revenue" && <RevenueTab filters={filters} />}
    </div>
  );
}

export default AnalyticsPage;
