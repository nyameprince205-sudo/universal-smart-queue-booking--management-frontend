import { useEffect, useState } from "react";
import {
BarChart,
Bar,
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
AreaChart,
Area,
} from "recharts";
import {
CalendarDays,
ChartNoAxesCombined,
Clock3,
ClipboardList,
Users,
CircleAlert,
RefreshCw,
TrendingUp,
CheckCircle2,
UserX,
} from "lucide-react";

import {
getBookingReport,
getQueuePerformanceReport,
getNoShowReport,
} from "../../api/reports";

import DateRangePicker from "../../components/DateRangePicker";
import StatCard from "../../components/StatCard";
import { formatDuration } from "../../utils/formatDuration";

const TABS = [
{ label: "Bookings", icon: ClipboardList },
{ label: "Queue Performance", icon: ChartNoAxesCombined },
{ label: "No-Shows", icon: UserX },
];

const cardClass =
"rounded-2xl border border-slate-200/80 bg-white shadow-sm";

const chartGridColor = "#e2e8f0";
const axisStyle = { fontSize: 11, fill: "#64748b" };

function ReportError({ message, onRetry }) {
return ( <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"> <div className="flex items-start gap-3"> <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" /> <div> <p className="font-semibold text-red-800">
Unable to load report </p> <p className="mt-1 text-sm text-red-700">{message}</p> </div> </div>


  {onRetry && (
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
    >
      <RefreshCw className="h-4 w-4" />
      Try again
    </button>
  )}
</div>


);
}

function ReportLoading() {
return ( <div className="mt-6 grid gap-5"> <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
{[1, 2, 3].map((item) => (
<div
key={item}
className={`${cardClass} animate-pulse p-5`}
> <div className="h-3 w-28 rounded bg-slate-200" /> <div className="mt-4 h-8 w-20 rounded bg-slate-200" /> <div className="mt-3 h-3 w-36 rounded bg-slate-100" /> </div>
))} </div>


  <div className={`${cardClass} animate-pulse p-5`}>
    <div className="h-4 w-40 rounded bg-slate-200" />
    <div className="mt-6 h-56 rounded-xl bg-slate-100" />
  </div>
</div>


);
}

function EmptyReport({ message = "No report data is available for this period." }) {
return (
<div className={`${cardClass} mt-6 flex flex-col items-center px-6 py-14 text-center`}> <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100"> <ChartNoAxesCombined className="h-7 w-7 text-slate-400" /> </div>


  <h3 className="mt-4 font-semibold text-slate-800">
    Nothing to display yet
  </h3>

  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
    {message}
  </p>
</div>


);
}

function ChartCard({ title, description, icon: Icon, children }) {
return (
<section className={`${cardClass} min-w-0 p-4 sm:p-6`}> <div className="mb-5 flex items-start gap-3">
{Icon && ( <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50"> <Icon className="h-5 w-5 text-emerald-700" /> </div>
)}


    <div className="min-w-0">
      <h2 className="font-semibold text-slate-800">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  </div>

  {children}
</section>


);
}

function ChartTooltip({ active, payload, label }) {
if (!active || !payload?.length) return null;

return ( <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
{label && ( <p className="mb-2 text-xs font-medium text-slate-500">
{label} </p>
)}


  {payload.map((entry, index) => (
    <div
      key={`${entry.dataKey}-${index}`}
      className="flex items-center gap-2 py-0.5"
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: entry.color || "#047857" }}
      />
      <span className="text-sm text-slate-600">
        {entry.name || entry.dataKey}
      </span>
      <span className="ml-auto pl-4 text-sm font-semibold text-slate-800">
        {entry.value}
      </span>
    </div>
  ))}
</div>


);
}

function BookingsReportTab({ filters }) {
const [report, setReport] = useState(null);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);
const [retryKey, setRetryKey] = useState(0);

useEffect(() => {
let cancelled = false;


async function loadReport() {
  setLoading(true);
  setError(null);

  try {
    const result = await getBookingReport(filters);

    if (!cancelled) setReport(result);
  } catch (err) {
    if (!cancelled) {
      setError(
        err.response?.data?.error || "Couldn't load the bookings report."
      );
    }
  } finally {
    if (!cancelled) setLoading(false);
  }
}

loadReport();

return () => {
  cancelled = true;
};


}, [filters, retryKey]);

if (loading) return <ReportLoading />;

if (error) {
return (
<ReportError
message={error}
onRetry={() => setRetryKey((key) => key + 1)}
/>
);
}

if (!report) return <EmptyReport />;

const byDay = report.byDay || [];

return ( <div className="mt-6 space-y-5 sm:space-y-6"> <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
<StatCard label="Total Bookings" value={report.totalBookings ?? 0} /> </div>


  {byDay.length === 0 ? (
    <EmptyReport message="There are no bookings recorded for the selected period." />
  ) : (
    <ChartCard
      title="Bookings over time"
      description="Daily booking activity across your selected date range."
      icon={CalendarDays}
    >
      <div className="h-64 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={byDay}
            margin={{ top: 8, right: 8, left: -18, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartGridColor}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              minTickGap={18}
            />
            <YAxis
              allowDecimals={false}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="total"
              name="Bookings"
              fill="#047857"
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )}
</div>


);
}

function QueuePerformanceTab({ filters }) {
const [report, setReport] = useState(null);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);
const [retryKey, setRetryKey] = useState(0);

useEffect(() => {
let cancelled = false;


async function loadReport() {
  setLoading(true);
  setError(null);

  try {
    const result = await getQueuePerformanceReport(filters);

    if (!cancelled) setReport(result);
  } catch (err) {
    if (!cancelled) {
      setError(
        err.response?.data?.error ||
          "Couldn't load the queue performance report."
      );
    }
  } finally {
    if (!cancelled) setLoading(false);
  }
}

loadReport();

return () => {
  cancelled = true;
};


}, [filters, retryKey]);

if (loading) return <ReportLoading />;

if (error) {
return (
<ReportError
message={error}
onRetry={() => setRetryKey((key) => key + 1)}
/>
);
}

if (!report) return <EmptyReport />;

const byDay = report.byDay || [];

return ( <div className="mt-6 space-y-5 sm:space-y-6"> <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
<StatCard
label="Tickets Served"
value={report.totalTicketsServed ?? 0}
/>
<StatCard
label="Average Wait Time"
value={formatDuration(report.averageWaitTimeSeconds ?? 0)}
/>
<StatCard
label="Average Service Time"
value={formatDuration(report.averageServiceTimeSeconds ?? 0)}
/> </div>


  {byDay.length === 0 ? (
    <EmptyReport message="No queue performance activity was recorded during this period." />
  ) : (
    <ChartCard
      title="Queue performance"
      description="Tickets served each day during the selected period."
      icon={TrendingUp}
    >
      <div className="h-64 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={byDay}
            margin={{ top: 8, right: 8, left: -18, bottom: 4 }}
          >
            <defs>
              <linearGradient
                id="queuePerformanceFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#059669"
                  stopOpacity={0.22}
                />
                <stop
                  offset="95%"
                  stopColor="#059669"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartGridColor}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              minTickGap={18}
            />
            <YAxis
              allowDecimals={false}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="ticketsServed"
              name="Tickets served"
              stroke="#047857"
              strokeWidth={2.5}
              fill="url(#queuePerformanceFill)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )}
</div>


);
}

function NoShowsTab({ filters }) {
const [report, setReport] = useState(null);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);
const [retryKey, setRetryKey] = useState(0);

useEffect(() => {
let cancelled = false;


async function loadReport() {
  setLoading(true);
  setError(null);

  try {
    const result = await getNoShowReport(filters);

    if (!cancelled) setReport(result);
  } catch (err) {
    if (!cancelled) {
      setError(
        err.response?.data?.error || "Couldn't load the no-show report."
      );
    }
  } finally {
    if (!cancelled) setLoading(false);
  }
}

loadReport();

return () => {
  cancelled = true;
};


}, [filters, retryKey]);

if (loading) return <ReportLoading />;

if (error) {
return (
<ReportError
message={error}
onRetry={() => setRetryKey((key) => key + 1)}
/>
);
}

if (!report) return <EmptyReport />;

const byService = report.byService || [];

return ( <div className="mt-6 space-y-5 sm:space-y-6"> <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
<StatCard label="Completed" value={report.completed ?? 0} />
<StatCard label="No-Shows" value={report.noShow ?? 0} />
<StatCard
label="No-Show Rate"
value={`${report.noShowRatePercent ?? 0}%`}
/> </div>


  <section className={`${cardClass} overflow-hidden`}>
    <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-5 sm:px-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
        <Users className="h-5 w-5 text-amber-700" />
      </div>
      <div>
        <h2 className="font-semibold text-slate-800">
          Attendance by service
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Compare completed appointments and missed visits.
        </p>
      </div>
    </div>

    {byService.length === 0 ? (
      <div className="px-6 py-12 text-center text-sm text-slate-500">
        No service attendance data is available for this period.
      </div>
    ) : (
      <>
        <div className="space-y-3 p-4 sm:hidden">
          {byService.map((service) => (
            <article
              key={service.serviceId}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-800">
                  {service.serviceName}
                </h3>
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  {service.noShowRatePercent}%
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Completed</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">
                    {service.completed}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">No-shows</p>
                  <p className="mt-1 text-lg font-semibold text-amber-700">
                    {service.noShow}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Completed</th>
                <th className="px-6 py-4 font-semibold">No-shows</th>
                <th className="px-6 py-4 font-semibold">No-show rate</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {byService.map((service) => (
                <tr
                  key={service.serviceId}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {service.serviceName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      {service.completed}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {service.noShow}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      {service.noShowRatePercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </section>
</div>


);
}

function ReportsPage() {
const [activeTab, setActiveTab] = useState("Bookings");
const [filters, setFilters] = useState(null);

const ActiveIcon =
TABS.find((tab) => tab.label === activeTab)?.icon || ClipboardList;

return ( <main className="min-h-full bg-slate-50/70 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"> <div className="mx-auto max-w-7xl"> <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"> <div> <div className="flex items-center gap-2 text-sm font-medium text-emerald-700"> <ChartNoAxesCombined className="h-4 w-4" />
Business insights </div>


        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Reports & Analytics
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          Understand bookings, monitor queue efficiency, and track
          customer attendance.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm sm:self-auto">
        <CalendarDays className="h-4 w-4 text-emerald-700" />
        <span>Reporting period</span>
      </div>
    </header>

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">
            Choose a date range
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Filter the report to the period you want to analyse.
          </p>
        </div>

        <div className="min-w-0">
          <DateRangePicker onChange={setFilters} />
        </div>
      </div>
    </section>

    <section className="mt-6 sm:mt-8">
      <div className="flex items-center gap-2">
        <ActiveIcon className="h-5 w-5 text-emerald-700" />
        <h2 className="text-lg font-bold text-slate-900">
          {activeTab}
        </h2>
      </div>

      <div
        role="tablist"
        aria-label="Report categories"
        className="mt-4 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
      >
        {TABS.map(({ label, icon: Icon }) => {
          const isActive = activeTab === label;

          return (
            <button
              key={label}
              id={`report-tab-${label.replace(/\s+/g, "-").toLowerCase()}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(label)}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-1 sm:px-5 ${
                isActive
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`report-tab-${activeTab.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {activeTab === "Bookings" && (
          <BookingsReportTab filters={filters} />
        )}
        {activeTab === "Queue Performance" && (
          <QueuePerformanceTab filters={filters} />
        )}
        {activeTab === "No-Shows" && (
          <NoShowsTab filters={filters} />
        )}
      </div>
    </section>

    <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <span>Reports & Analytics</span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5" />
        Figures reflect the selected reporting period.
      </span>
    </footer>
  </div>
</main>


);
}

export default ReportsPage;
