import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Users, CheckCircle2, UserCog, Gauge, TrendingUp, TrendingDown } from "lucide-react";
import { getExecutiveSummary } from "../../api/analytics";
import StatCard from "../../components/StatCard";
import { formatDuration } from "../../utils/formatDuration";
const REFRESH_INTERVAL_MS = 30000;
function BranchCard({
  branch
}) {
  return <Link to="/admin/analytics" className={`block rounded-lg border p-4 hover:border-sky-300 transition-colors ${branch.overloaded ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
      <div className="flex items-center justify-between">
        <p className="font-medium text-slate-800">{branch.branchName}</p>
        <span className={`w-2 h-2 rounded-full ${branch.overloaded ? "bg-red-500" : "bg-green-500"}`} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <p className="text-slate-400">Waiting</p>
          <p className="font-semibold text-slate-800">{branch.customersWaiting}</p>
        </div>
        <div>
          <p className="text-slate-400">Served today</p>
          <p className="font-semibold text-slate-800">{branch.ticketsServedToday}</p>
        </div>
        <div>
          <p className="text-slate-400">Bookings today</p>
          <p className="font-semibold text-slate-800">{branch.bookingsToday}</p>
        </div>
        <div>
          <p className="text-slate-400">Staff available</p>
          <p className="font-semibold text-slate-800">{branch.staffAvailable}</p>
        </div>
        <div>
          <p className="text-slate-400">Avg wait</p>
          <p className="font-semibold text-slate-800">{formatDuration(branch.averageWaitTimeSeconds)}</p>
        </div>
        <div>
          <p className="text-slate-400">Queue efficiency</p>
          <p className="font-semibold text-slate-800">
            {branch.queueEfficiencyPercent != null ? `${branch.queueEfficiencyPercent}%` : "—"}
          </p>
        </div>
      </div>
    </Link>;
}
function SummaryCard({
  label,
  value,
  detail,
  icon: Icon
}) {
  return <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {Icon && <Icon className="w-4 h-4" />}
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="mt-1 text-lg font-semibold text-slate-800">{value}</p>
      {detail && <p className="text-xs text-slate-500">{detail}</p>}
    </div>;
}
function GrowthValue({
  percent
}) {
  if (percent == null) return <span className="text-slate-400">—</span>;
  const Icon = percent >= 0 ? TrendingUp : TrendingDown;
  const color = percent >= 0 ? "text-green-600" : "text-red-600";
  return <span className={`inline-flex items-center gap-1 ${color}`}>
      <Icon className="w-4 h-4" /> {Math.abs(percent)}%
    </span>;
}
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
    return <div className="p-8 max-w-5xl">
        <p className="text-slate-400">Loading…</p>
      </div>;
  }
  if (error) {
    return <div className="p-8 max-w-5xl">
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      </div>;
  }
  const {
    summary: extras
  } = summary;
  return <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold text-slate-800">Executive Dashboard</h1>
        <p className="text-xs text-slate-400">
          Updated {new Date(summary.generatedAt).toLocaleTimeString()} · refreshes automatically
        </p>
      </div>

      {summary.alerts.length > 0 && <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-medium text-red-800">
            {summary.alerts.length} branch{summary.alerts.length > 1 ? "es" : ""} need attention
          </p>
          <ul className="mt-1 space-y-1">
            {summary.alerts.map(a => <li key={a.branchId} className="text-sm text-red-700">
                <span className="font-medium">{a.branchName}:</span> {a.reason}
              </li>)}
          </ul>
        </div>}

      <p className="mt-6 text-sm font-medium text-slate-500">Live Right Now</p>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Customers Waiting" value={summary.live.customersWaiting} accent="gold" />
        <StatCard label="Being Served" value={summary.live.customersServing} accent="forest" />
        <StatCard label="Active Staff" value={summary.live.activeStaffCount} />
        <StatCard label="Open Counters" value={summary.live.activeCounters} />
      </div>

      <p className="mt-6 text-sm font-medium text-slate-500">Today</p>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Completed" value={summary.today.customersCompleted} accent="forest" />
        <StatCard label="Avg Wait" value={formatDuration(summary.today.averageWaitTimeSeconds)} />
        <StatCard label="Avg Service" value={formatDuration(summary.today.averageServiceTimeSeconds)} />
        <StatCard label="Revenue" value={`GHS ${summary.today.revenue.toFixed(2)}`} accent="gold" />
      </div>

      
      <p className="mt-6 text-sm font-medium text-slate-500">Executive Summary</p>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SummaryCard label="Weekly Growth" value={<GrowthValue percent={extras.weeklyGrowthPercent} />} detail="bookings vs last week" icon={TrendingUp} />
        <SummaryCard label="Monthly Growth" value={<GrowthValue percent={extras.monthlyGrowthPercent} />} detail="bookings vs last month" icon={TrendingUp} />
        <SummaryCard label="Best Performing Branch" value={extras.bestBranch?.branchName || "—"} detail={extras.bestBranch ? `${extras.bestBranch.ticketsServedToday} served today` : undefined} icon={Users} />
        <SummaryCard label="Best Staff" value={extras.bestStaff?.name || "—"} detail={extras.bestStaff ? `${extras.bestStaff.completed} completed today` : undefined} icon={UserCog} />
        <SummaryCard label="Most Requested Service" value={extras.mostRequestedService?.serviceName || "—"} detail={extras.mostRequestedService ? `${extras.mostRequestedService.count} bookings today` : undefined} icon={CheckCircle2} />
        <SummaryCard label="Highest / Lowest Wait" value={extras.highestWaitBranch ? `${extras.highestWaitBranch.branchName}` : "—"} detail={extras.lowestWaitBranch ? `Lowest: ${extras.lowestWaitBranch.branchName}` : undefined} icon={Gauge} />
      </div>

      
      {summary.branchRanking.length > 0 && <>
          <p className="mt-6 text-sm font-medium text-slate-500">Branch Performance</p>
          <div className="mt-2 grid sm:grid-cols-2 gap-4">
            {summary.branchRanking.map(branch => <BranchCard key={branch.branchId} branch={branch} />)}
          </div>
        </>}

      <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden">
        <p className="text-sm font-medium text-slate-500 px-5 pt-5 pb-3">Service Ranking (today)</p>
        {summary.serviceRanking.length === 0 ? <p className="text-sm text-slate-400 px-5 pb-5">No completed bookings yet today.</p> : <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-2 font-medium">Service</th>
                <th className="px-5 py-2 font-medium">Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.serviceRanking.map(s => <tr key={s.serviceId}>
                  <td className="px-5 py-2 font-medium text-slate-800">{s.serviceName}</td>
                  <td className="px-5 py-2 text-slate-600">{s.count}</td>
                </tr>)}
            </tbody>
          </table>}
      </div>
    </div>;
}
export default ExecutiveDashboardPage;