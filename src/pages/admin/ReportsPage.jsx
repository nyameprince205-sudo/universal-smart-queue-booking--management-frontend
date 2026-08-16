import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getBookingReport, getQueuePerformanceReport, getNoShowReport } from "../../api/reports";
import DateRangePicker from "../../components/DateRangePicker";
import StatCard from "../../components/StatCard";
import { formatDuration } from "../../utils/formatDuration";
const TABS = ["Bookings", "Queue Performance", "No-Shows"];
function BookingsReportTab({
  filters
}) {
  const [report, setReport] = useState(null);
  useEffect(() => {
    if (filters) getBookingReport(filters).then(setReport);
  }, [filters]);
  if (!report) return <p className="mt-8 text-slate-400">Loading…</p>;
  return <div className="mt-6 space-y-6">
      <StatCard label="Total Bookings" value={report.totalBookings} />
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <p className="text-sm font-medium text-slate-500 mb-4">Bookings by Day</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={report.byDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{
            fontSize: 10,
            fill: "#64748b"
          }} />
            <YAxis allowDecimals={false} tick={{
            fontSize: 11,
            fill: "#64748b"
          }} />
            <Tooltip />
            <Bar dataKey="total" fill="#0284c7" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>;
}
function QueuePerformanceTab({
  filters
}) {
  const [report, setReport] = useState(null);
  useEffect(() => {
    if (filters) getQueuePerformanceReport(filters).then(setReport);
  }, [filters]);
  if (!report) return <p className="mt-8 text-slate-400">Loading…</p>;
  return <div className="mt-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Tickets Served" value={report.totalTicketsServed} />
        <StatCard label="Avg Wait Time" value={formatDuration(report.averageWaitTimeSeconds)} />
        <StatCard label="Avg Service Time" value={formatDuration(report.averageServiceTimeSeconds)} />
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <p className="text-sm font-medium text-slate-500 mb-4">Tickets Served by Day</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={report.byDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{
            fontSize: 10,
            fill: "#64748b"
          }} />
            <YAxis allowDecimals={false} tick={{
            fontSize: 11,
            fill: "#64748b"
          }} />
            <Tooltip />
            <Line type="monotone" dataKey="ticketsServed" stroke="#0284c7" strokeWidth={2} dot={{
            r: 3
          }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>;
}
function NoShowsTab({
  filters
}) {
  const [report, setReport] = useState(null);
  useEffect(() => {
    if (filters) getNoShowReport(filters).then(setReport);
  }, [filters]);
  if (!report) return <p className="mt-8 text-slate-400">Loading…</p>;
  return <div className="mt-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Completed" value={report.completed} />
        <StatCard label="No-Shows" value={report.noShow} />
        <StatCard label="No-Show Rate" value={`${report.noShowRatePercent}%`} />
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <p className="text-sm font-medium text-slate-500 px-5 pt-5 pb-3">By Service</p>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-2 font-medium">Service</th>
              <th className="px-5 py-2 font-medium">Completed</th>
              <th className="px-5 py-2 font-medium">No-Shows</th>
              <th className="px-5 py-2 font-medium">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.byService.map(s => <tr key={s.serviceId}>
                <td className="px-5 py-2 font-medium text-slate-800">{s.serviceName}</td>
                <td className="px-5 py-2 text-slate-600">{s.completed}</td>
                <td className="px-5 py-2 text-slate-600">{s.noShow}</td>
                <td className="px-5 py-2 text-slate-600">{s.noShowRatePercent}%</td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}
function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Bookings");
  const [filters, setFilters] = useState(null);
  return <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">Reports</h1>
        <DateRangePicker onChange={setFilters} />
      </div>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        {TABS.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {tab}
          </button>)}
      </div>

      {activeTab === "Bookings" && <BookingsReportTab filters={filters} />}
      {activeTab === "Queue Performance" && <QueuePerformanceTab filters={filters} />}
      {activeTab === "No-Shows" && <NoShowsTab filters={filters} />}
    </div>;
}
export default ReportsPage;