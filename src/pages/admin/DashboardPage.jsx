import { useEffect, useState, useCallback } from "react";
import {
  Calendar, Ticket, Users, UserCheck, CheckCircle2, Clock, Timer,
  UserCog, Grid3x3, Building2, CalendarCheck, CalendarX, UserX, Gauge,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getHomeDashboard } from "../../api/analytics";
import { formatDuration } from "../../utils/formatDuration";

// Phase 18 Module 3: refreshes automatically every 30s rather than
// requiring a manual reload — see ExecutiveDashboardPage.jsx for the same
// pattern and the same reasoning (a real live-second feed would need new
// Socket.IO broadcast events across the whole org; 30s polling is the
// right amount of "live" for a dashboard someone glances at).
const REFRESH_INTERVAL_MS = 30000;

// One card renders every KPI shape. `isLive` swaps the trend arrow for a
// pulsing "Live" badge — see getHomeDashboard's own comment for why two of
// these 14 KPIs (customersWaiting, customersServing) can't have a
// meaningful "vs yesterday" number: there's no historical snapshot of what
// the live queue looked like at this exact time yesterday to compare against.
function KPICard({ label, value, icon: Icon, trendPercent, goodDirection, isLive }) {
  const trendIsGood = trendPercent == null ? null : goodDirection === "up" ? trendPercent >= 0 : trendPercent <= 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="rounded-md bg-sky-50 p-1.5">
          <Icon className="w-4 h-4 text-sky-600" />
        </div>
        {isLive ? (
          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        ) : trendPercent != null ? (
          <span className={`text-xs font-medium ${trendIsGood ? "text-green-600" : "text-red-600"}`}>
            {trendPercent > 0 ? "↑" : trendPercent < 0 ? "↓" : "–"} {Math.abs(trendPercent)}%
          </span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await getHomeDashboard();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load the dashboard.");
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

  const { live, today } = data;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-xs text-slate-400">
          Updated {new Date(data.generatedAt).toLocaleTimeString()} · refreshes automatically
        </p>
      </div>

      <p className="mt-6 text-sm font-medium text-slate-500">Live Right Now</p>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Customers Waiting" value={live.customersWaiting} icon={Users} isLive />
        <KPICard label="Being Served" value={live.customersServing} icon={UserCheck} isLive />
        <KPICard label="Active Counters" value={live.activeCounters} icon={Grid3x3} isLive />
        <KPICard label="Active Branches" value={live.activeBranches} icon={Building2} isLive />
      </div>

      <p className="mt-6 text-sm font-medium text-slate-500">Today's Performance (vs yesterday)</p>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard {...today.bookings} label="Today's Bookings" value={today.bookings.value} icon={Calendar} />
        <KPICard {...today.queueTickets} label="Today's Queue Tickets" value={today.queueTickets.value} icon={Ticket} />
        <KPICard {...today.customersServed} label="Customers Served" value={today.customersServed.value} icon={CheckCircle2} />
        <KPICard {...today.activeStaff} label="Active Staff" value={today.activeStaff.value} icon={UserCog} />
        <KPICard
          {...today.averageWaitTimeSeconds}
          label="Avg Waiting Time"
          value={formatDuration(today.averageWaitTimeSeconds.value)}
          icon={Clock}
        />
        <KPICard
          {...today.averageServiceTimeSeconds}
          label="Avg Service Time"
          value={formatDuration(today.averageServiceTimeSeconds.value)}
          icon={Timer}
        />
        <KPICard {...today.completedAppointments} label="Completed" value={today.completedAppointments.value} icon={CalendarCheck} />
        <KPICard {...today.cancelledAppointments} label="Cancelled" value={today.cancelledAppointments.value} icon={CalendarX} />
        <KPICard {...today.missedCustomers} label="Missed Customers" value={today.missedCustomers.value} icon={UserX} />
        <KPICard
          {...today.queueEfficiencyPercent}
          label="Queue Efficiency"
          value={today.queueEfficiencyPercent.value != null ? `${today.queueEfficiencyPercent.value}%` : "—"}
          icon={Gauge}
        />
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-4">Queue Activity (last 7 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.queueActivityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0284c7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-4">Bookings (last 7 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.bookingsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
