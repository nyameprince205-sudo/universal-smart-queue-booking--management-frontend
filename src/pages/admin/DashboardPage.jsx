import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
Calendar,
Ticket,
Users,
UserCheck,
CheckCircle2,
Clock,
Timer,
UserCog,
Grid3x3,
Building2,
CalendarCheck,
CalendarX,
UserX,
Gauge,
CalendarPlus,
UserPlus,
FolderPlus,
Wrench,
FileBarChart,
CreditCard,
TrendingUp,
TrendingDown,
Minus,
RefreshCw,
Activity,
ArrowUpRight,
AlertCircle,
BarChart3,
CircleHelp,
} from "lucide-react";
import {
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
} from "recharts";
import { getHomeDashboard } from "../../api/analytics";
import { formatDuration } from "../../utils/formatDuration";
import ActivityFeed from "../../components/ActivityFeed";

const REFRESH_INTERVAL_MS = 30000;

const QUICK_ACTIONS = [
{
to: "/admin/bookings",
label: "Create Booking",
description: "Register a new booking",
icon: CalendarPlus,
},
{
to: "/admin/staff",
label: "Add Staff",
description: "Manage your team",
icon: UserPlus,
},
{
to: "/admin/branches",
label: "Create Branch",
description: "Expand your business",
icon: FolderPlus,
},
{
to: "/admin/services",
label: "Create Service",
description: "Manage your services",
icon: Wrench,
},
{
to: "/staff/queue",
label: "View Queue",
description: "Monitor customers",
icon: Ticket,
},
{
to: "/admin/reports",
label: "Generate Report",
description: "Review performance",
icon: FileBarChart,
},
{
to: "/admin/subscription",
label: "Subscription",
description: "Manage your plan",
icon: CreditCard,
},
];

function formatMetric(value) {
if (value === null || value === undefined || value === "") {
return "—";
}

if (typeof value === "number") {
return value.toLocaleString();
}

return value;
}

function KPICard({
label,
value,
icon: Icon,
trendPercent,
goodDirection = "up",
isLive = false,
accent = "emerald",
}) {
const trendIsGood =
trendPercent == null
? null
: goodDirection === "up"
? trendPercent >= 0
: trendPercent <= 0;

const accentStyles = {
emerald: {
icon: "bg-emerald-50 text-emerald-700",
border: "hover:border-emerald-200",
},
amber: {
icon: "bg-amber-50 text-amber-700",
border: "hover:border-amber-200",
},
blue: {
icon: "bg-blue-50 text-blue-700",
border: "hover:border-blue-200",
},
rose: {
icon: "bg-rose-50 text-rose-700",
border: "hover:border-rose-200",
},
violet: {
icon: "bg-violet-50 text-violet-700",
border: "hover:border-violet-200",
},
};

const style = accentStyles[accent] || accentStyles.emerald;

return (
<article
className={`group rounded-2xl border border-stone-200 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${style.border}`}
> <div className="flex items-start justify-between gap-3">
<div className={`rounded-xl p-2.5 ${style.icon}`}> <Icon className="h-5 w-5" strokeWidth={1.8} /> </div>


    {isLive ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Live
      </span>
    ) : trendPercent != null ? (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
          trendIsGood
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700"
        }`}
      >
        {trendPercent > 0 ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : trendPercent < 0 ? (
          <TrendingDown className="h-3.5 w-3.5" />
        ) : (
          <Minus className="h-3.5 w-3.5" />
        )}
        {Math.abs(trendPercent)}%
      </span>
    ) : (
      <span className="text-xs text-stone-300">—</span>
    )}
  </div>

  <div className="mt-5">
    <p className="break-words text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
      {value}
    </p>
    <p className="mt-1 text-sm font-medium leading-5 text-stone-500">
      {label}
    </p>
  </div>
</article>


);
}

function SectionHeading({ eyebrow, title, description, icon: Icon }) {
return ( <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"> <div>
{eyebrow && ( <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
{eyebrow} </p>
)}


    <div className="flex items-center gap-2">
      {Icon && (
        <Icon className="h-5 w-5 shrink-0 text-emerald-700" />
      )}
      <h2 className="text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
        {title}
      </h2>
    </div>

    {description && (
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    )}
  </div>
</div>


);
}

function QuickActions() {
return ( <section className="mt-7"> <SectionHeading
     eyebrow="Shortcuts"
     title="Quick actions"
     description="Get common tasks done without navigating through multiple pages."
     icon={ArrowUpRight}
   />


  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
    {QUICK_ACTIONS.map(({ to, label, description, icon: Icon }) => (
      <Link
        key={to}
        to={to}
        className="group flex min-w-0 items-start gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 transition duration-200 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm sm:p-4"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-5 text-stone-800 group-hover:text-emerald-800">
            {label}
          </span>
          <span className="mt-1 hidden text-xs leading-4 text-stone-500 sm:block">
            {description}
          </span>
        </span>
      </Link>
    ))}
  </div>
</section>


);
}

function ChartCard({ title, description, data, barColor, emptyMessage }) {
const hasData = Array.isArray(data) && data.length > 0;

return ( <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"> <div className="mb-5 flex items-start gap-3"> <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700"> <BarChart3 className="h-5 w-5" /> </span>


    <div className="min-w-0">
      <h3 className="font-bold text-stone-900">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-stone-500">
        {description}
      </p>
    </div>
  </div>

  {hasData ? (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: -18, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e7e5e4"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#78716c" }}
            tickMargin={10}
          />

          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#78716c" }}
          />

          <Tooltip
            cursor={{ fill: "#f5f5f4" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e7e5e4",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              fontSize: "12px",
            }}
            formatter={(value) => [value, "Count"]}
          />

          <Bar
            dataKey="count"
            fill={barColor}
            radius={[5, 5, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50/70 px-4 text-center">
      <BarChart3 className="mb-3 h-8 w-8 text-stone-300" />
      <p className="text-sm font-semibold text-stone-700">
        No chart data available
      </p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-stone-500">
        {emptyMessage || "Activity will appear here when data is available."}
      </p>
    </div>
  )}
</section>


);
}

function DashboardSkeleton() {
return ( <div className="mx-auto w-full max-w-[1600px] animate-pulse space-y-7 p-4 sm:p-6 lg:p-8"> <div> <div className="h-3 w-24 rounded bg-stone-200" /> <div className="mt-3 h-8 w-56 rounded-lg bg-stone-200" /> <div className="mt-2 h-4 w-72 max-w-full rounded bg-stone-100" /> </div>


  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="h-32 rounded-2xl border border-stone-100 bg-white"
      />
    ))}
  </div>

  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 7 }).map((_, index) => (
      <div key={index} className="h-20 rounded-2xl bg-stone-100" />
    ))}
  </div>

  <div className="grid gap-5 lg:grid-cols-2">
    <div className="h-80 rounded-2xl bg-stone-100" />
    <div className="h-80 rounded-2xl bg-stone-100" />
  </div>
</div>


);
}

function DashboardError({ message, onRetry }) {
return ( <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center p-6"> <div className="w-full rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm sm:p-10"> <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"> <AlertCircle className="h-7 w-7" /> </span>


    <h2 className="mt-5 text-xl font-bold text-stone-900">
      We couldn't load your dashboard
    </h2>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
      {message}
    </p>

    <button
      type="button"
      onClick={onRetry}
      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100"
    >
      <RefreshCw className="h-4 w-4" />
      Try again
    </button>
  </div>
</div>


);
}

function DashboardPage() {
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState(null);
const [lastUpdated, setLastUpdated] = useState(null);

const load = useCallback(async (isBackgroundRefresh = false) => {
if (isBackgroundRefresh) {
setRefreshing(true);
}


try {
  const result = await getHomeDashboard();

  setData(result);
  setError(null);
  setLastUpdated(result?.generatedAt || new Date().toISOString());
} catch (err) {
  const message =
    err.response?.data?.error || "Couldn't load the dashboard.";

  setError(message);
} finally {
  setLoading(false);
  setRefreshing(false);
}


}, []);

useEffect(() => {
load();


const interval = setInterval(() => {
  load(true);
}, REFRESH_INTERVAL_MS);

return () => clearInterval(interval);


}, [load]);

if (loading && !data) {
return <DashboardSkeleton />;
}

if (error && !data) {
return <DashboardError message={error} onRetry={() => load()} />;
}

if (!data) {
return <DashboardError
message="No dashboard data was returned. Please try again."
onRetry={() => load()}
/>;
}

const { live, today } = data;

const liveMetrics = [
{
label: "Customers Waiting",
value: live.customersWaiting,
icon: Users,
accent: "amber",
},
{
label: "Being Served",
value: live.customersServing,
icon: UserCheck,
accent: "emerald",
},
{
label: "Active Counters",
value: live.activeCounters,
icon: Grid3x3,
accent: "blue",
},
{
label: "Active Branches",
value: live.activeBranches,
icon: Building2,
accent: "violet",
},
];

const performanceMetrics = [
{
...today.bookings,
label: "Today's Bookings",
value: formatMetric(today.bookings.value),
icon: Calendar,
accent: "emerald",
goodDirection: "up",
},
{
...today.queueTickets,
label: "Queue Tickets",
value: formatMetric(today.queueTickets.value),
icon: Ticket,
accent: "blue",
goodDirection: "up",
},
{
...today.customersServed,
label: "Customers Served",
value: formatMetric(today.customersServed.value),
icon: CheckCircle2,
accent: "emerald",
goodDirection: "up",
},
{
...today.activeStaff,
label: "Active Staff",
value: formatMetric(today.activeStaff.value),
icon: UserCog,
accent: "violet",
goodDirection: "up",
},
{
...today.averageWaitTimeSeconds,
label: "Average Waiting Time",
value: formatDuration(today.averageWaitTimeSeconds.value),
icon: Clock,
accent: "amber",
goodDirection: "down",
},
{
...today.averageServiceTimeSeconds,
label: "Average Service Time",
value: formatDuration(today.averageServiceTimeSeconds.value),
icon: Timer,
accent: "blue",
goodDirection: "down",
},
{
...today.completedAppointments,
label: "Completed Appointments",
value: formatMetric(today.completedAppointments.value),
icon: CalendarCheck,
accent: "emerald",
goodDirection: "up",
},
{
...today.cancelledAppointments,
label: "Cancelled Appointments",
value: formatMetric(today.cancelledAppointments.value),
icon: CalendarX,
accent: "rose",
goodDirection: "down",
},
{
...today.missedCustomers,
label: "Missed Customers",
value: formatMetric(today.missedCustomers.value),
icon: UserX,
accent: "rose",
goodDirection: "down",
},
{
...today.queueEfficiencyPercent,
label: "Queue Efficiency",
value:
today.queueEfficiencyPercent.value != null
? `${today.queueEfficiencyPercent.value}%`
: "—",
icon: Gauge,
accent: "emerald",
goodDirection: "up",
},
];

const updatedTime = lastUpdated
? new Date(lastUpdated).toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit",
})
: "—";

return ( <main className="mx-auto w-full max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">
{/* Page header */} <header className="relative overflow-hidden rounded-3xl bg-emerald-950 px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9"> <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10" /> <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" /> <div className="pointer-events-none absolute -bottom-20 right-1/4 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />


    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
          <Activity className="h-3.5 w-3.5" />
          Business overview
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Dashboard
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100/80 sm:text-base">
          Monitor your queue, manage bookings, and see how your business is
          performing.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
          <p className="text-xs text-emerald-100/70">Last updated</p>
          <p className="mt-1 text-sm font-semibold">{updatedTime}</p>
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-amber-200/30"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>
    </div>

    {error && (
      <div
        role="status"
        className="relative mt-5 flex items-start gap-2 rounded-xl border border-amber-200/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          The latest refresh failed. Showing the last successfully loaded
          data. {error}
        </span>
      </div>
    )}
  </header>

  {/* Quick actions */}
  <QuickActions />

  {/* Live metrics */}
  <section>
    <SectionHeading
      eyebrow="Real-time overview"
      title="Live right now"
      description="A snapshot of activity across your business."
      icon={Activity}
    />

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {liveMetrics.map((metric) => (
        <KPICard
          key={metric.label}
          {...metric}
          value={formatMetric(metric.value)}
          isLive
        />
      ))}
    </div>
  </section>

  {/* Daily performance */}
  <section>
    <SectionHeading
      eyebrow="Daily analytics"
      title="Today's performance"
      description="Compare today's results with yesterday's performance."
      icon={TrendingUp}
    />

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-5">
      {performanceMetrics.map((metric) => (
        <KPICard key={metric.label} {...metric} />
      ))}
    </div>
  </section>

  {/* Charts */}
  <section>
    <SectionHeading
      eyebrow="Activity trends"
      title="Your business at a glance"
      description="Review recent queue activity and booking volume."
      icon={BarChart3}
    />

    <div className="grid min-w-0 gap-5 lg:grid-cols-2">
      <ChartCard
        title="Queue activity"
        description="Queue tickets created over the last seven days."
        data={data.queueActivityTrend}
        barColor="#047857"
        emptyMessage="Queue activity will appear here once customers start joining the queue."
      />

      <ChartCard
        title="Bookings"
        description="Booking volume over the last seven days."
        data={data.bookingsTrend}
        barColor="#d97706"
        emptyMessage="Your booking trend will appear here once bookings have been recorded."
      />
    </div>
  </section>

  {/* Activity feed */}
  <section>
    <SectionHeading
      eyebrow="Recent updates"
      title="Activity feed"
      description="Keep track of recent actions and changes in your system."
      icon={Clock}
    />

    <div className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-5">
      <ActivityFeed />
    </div>
  </section>

  {/* Help note */}
  <footer className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
      <CircleHelp className="h-5 w-5" />
    </span>

    <div>
      <p className="text-sm font-semibold text-emerald-950">
        Keep your operations running smoothly
      </p>
      <p className="mt-1 text-sm leading-6 text-emerald-900/70">
        Use the live metrics to monitor waiting customers, and review your
        daily performance to identify where your service can improve.
      </p>
    </div>
  </footer>
</main>


);
}

export default DashboardPage;
