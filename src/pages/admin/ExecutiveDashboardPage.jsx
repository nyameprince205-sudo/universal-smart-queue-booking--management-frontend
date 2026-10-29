import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
Users,
CheckCircle2,
UserCog,
Gauge,
TrendingUp,
TrendingDown,
Minus,
Clock,
Timer,
Building2,
Ticket,
Activity,
RefreshCw,
AlertTriangle,
ArrowUpRight,
BarChart3,
Trophy,
Medal,
CircleHelp,
CalendarDays,
Wallet,
CheckCircle,
XCircle,
} from "lucide-react";
import { getExecutiveSummary } from "../../api/analytics";
import StatCard from "../../components/StatCard";
import { formatDuration } from "../../utils/formatDuration";

const REFRESH_INTERVAL_MS = 30000;

function formatNumber(value) {
if (value === null || value === undefined || value === "") {
return "—";
}

return typeof value === "number" ? value.toLocaleString() : value;
}

function formatCurrency(value) {
const amount = Number(value);

if (!Number.isFinite(amount)) {
return "GHS —";
}

return `GHS ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SectionHeading({ eyebrow, title, description, icon: Icon }) {
return ( <div className="mb-4">
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
    <p className="mt-1 text-sm leading-6 text-stone-500">
      {description}
    </p>
  )}
</div>


);
}

function GrowthValue({ percent }) {
if (percent === null || percent === undefined) {
return <span className="text-stone-400">—</span>;
}

const positive = percent > 0;
const negative = percent < 0;

const Icon = positive
? TrendingUp
: negative
? TrendingDown
: Minus;

const color = positive
? "bg-emerald-50 text-emerald-700"
: negative
? "bg-rose-50 text-rose-700"
: "bg-stone-100 text-stone-600";

return (
<span
className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold ${color}`}
> <Icon className="h-4 w-4" />
{Math.abs(percent)}% </span>
);
}

function SummaryCard({ label, value, detail, icon: Icon, accent = "emerald" }) {
const accentStyles = {
emerald: "bg-emerald-50 text-emerald-700",
amber: "bg-amber-50 text-amber-700",
blue: "bg-blue-50 text-blue-700",
violet: "bg-violet-50 text-violet-700",
rose: "bg-rose-50 text-rose-700",
};

return ( <article className="flex min-w-0 flex-col rounded-2xl border border-stone-200 bg-white p-4 transition duration-200 hover:border-emerald-200 hover:shadow-md sm:p-5"> <div className="flex items-start justify-between gap-3">
<span
className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            accentStyles[accent] || accentStyles.emerald
          }`}
>
{Icon && <Icon className="h-5 w-5" strokeWidth={1.8} />} </span> </div>


  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">
    {label}
  </p>

  <div className="mt-2 min-w-0 break-words text-lg font-bold leading-6 text-stone-900 sm:text-xl">
    {value}
  </div>

  {detail && (
    <p className="mt-2 text-xs leading-5 text-stone-500">{detail}</p>
  )}
</article>


);
}

function BranchCard({ branch }) {
const overloaded = Boolean(branch.overloaded);

const metrics = [
{
label: "Customers waiting",
value: formatNumber(branch.customersWaiting),
icon: Users,
},
{
label: "Served today",
value: formatNumber(branch.ticketsServedToday),
icon: CheckCircle2,
},
{
label: "Bookings today",
value: formatNumber(branch.bookingsToday),
icon: CalendarDays,
},
{
label: "Staff available",
value: formatNumber(branch.staffAvailable),
icon: UserCog,
},
{
label: "Average wait",
value: formatDuration(branch.averageWaitTimeSeconds),
icon: Clock,
},
{
label: "Queue efficiency",
value:
branch.queueEfficiencyPercent != null
? `${branch.queueEfficiencyPercent}%`
: "—",
icon: Gauge,
},
];

return (
<Link
to="/admin/analytics"
className={`group block min-w-0 rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
        overloaded
          ? "border-rose-200 bg-rose-50/50 hover:border-rose-300"
          : "border-stone-200 bg-white hover:border-emerald-300"
      }`}
> <div className="flex items-start justify-between gap-3"> <div className="flex min-w-0 items-center gap-3">
<span
className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              overloaded
                ? "bg-rose-100 text-rose-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
> <Building2 className="h-5 w-5" /> </span>


      <div className="min-w-0">
        <h3 className="break-words font-bold text-stone-900 group-hover:text-emerald-800">
          {branch.branchName}
        </h3>

        <p className="mt-1 text-xs text-stone-500">
          Branch performance
        </p>
      </div>
    </div>

    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        overloaded
          ? "bg-rose-100 text-rose-700"
          : "bg-emerald-100 text-emerald-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          overloaded ? "bg-rose-500" : "bg-emerald-500"
        }`}
      />
      {overloaded ? "Needs attention" : "Normal"}
    </span>
  </div>

  <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
    {metrics.map(({ label, value, icon: Icon }) => (
      <div key={label} className="min-w-0">
        <div className="flex items-center gap-1.5 text-stone-500">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <p className="text-xs">{label}</p>
        </div>

        <p className="mt-1 break-words text-sm font-bold text-stone-900">
          {value}
        </p>
      </div>
    ))}
  </div>

  <div className="mt-5 flex items-center justify-between border-t border-stone-200/80 pt-3">
    <span className="text-xs font-medium text-stone-500">
      View analytics
    </span>

    <ArrowUpRight className="h-4 w-4 text-stone-400 transition group-hover:text-emerald-700" />
  </div>
</Link>


);
}

function AlertsPanel({ alerts }) {
if (!alerts?.length) {
return ( <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5"> <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700"> <CheckCircle className="h-5 w-5" /> </span>


    <div>
      <h3 className="font-bold text-emerald-900">
        All clear
      </h3>

      <p className="mt-1 text-sm leading-5 text-emerald-800/80">
        There are no branch alerts requiring attention in the latest report.
      </p>
    </div>
  </div>
);


}

return ( <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white"> <div className="flex items-start gap-3 border-b border-rose-100 bg-rose-50 px-4 py-4 sm:px-5"> <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700"> <AlertTriangle className="h-5 w-5" /> </span>


    <div className="min-w-0">
      <h2 className="font-bold text-rose-900">
        Branches requiring attention
      </h2>

      <p className="mt-1 text-sm leading-5 text-rose-800/80">
        {alerts.length} branch{alerts.length === 1 ? "" : "es"} reported
        an issue in the latest summary.
      </p>
    </div>

    <span className="ml-auto rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">
      {alerts.length}
    </span>
  </div>

  <div className="divide-y divide-stone-100">
    {alerts.map((alert) => (
      <div
        key={alert.branchId}
        className="flex items-start gap-3 px-4 py-4 sm:px-5"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
          <AlertTriangle className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <p className="break-words text-sm font-bold text-stone-900">
            {alert.branchName}
          </p>

          <p className="mt-1 text-sm leading-5 text-stone-600">
            {alert.reason}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>


);
}

function ServiceRanking({ services }) {
return ( <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white"> <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-4 sm:px-5"> <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"> <Trophy className="h-5 w-5" /> </span>


    <div>
      <h3 className="font-bold text-stone-900">Service ranking</h3>
      <p className="mt-1 text-xs text-stone-500">
        Booking activity today
      </p>
    </div>
  </div>

  {!services?.length ? (
    <div className="flex flex-col items-center px-5 py-10 text-center">
      <BarChart3 className="h-8 w-8 text-stone-300" />

      <p className="mt-3 text-sm font-semibold text-stone-700">
        No service rankings yet
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-stone-500">
        Service activity will appear here when bookings are recorded.
      </p>
    </div>
  ) : (
    <>
      {/* Mobile layout */}
      <div className="divide-y divide-stone-100 sm:hidden">
        {services.map((service, index) => (
          <div
            key={service.serviceId}
            className="flex items-center gap-3 px-4 py-3"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                index === 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {index === 0 ? (
                <Medal className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </span>

            <p className="min-w-0 flex-1 break-words text-sm font-semibold text-stone-800">
              {service.serviceName}
            </p>

            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {formatNumber(service.count)}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop layout */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Rank</th>
              <th className="px-5 py-3 font-semibold">Service</th>
              <th className="px-5 py-3 text-right font-semibold">
                Bookings
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {services.map((service, index) => (
              <tr
                key={service.serviceId}
                className="transition hover:bg-stone-50/70"
              >
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      index === 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>

                <td className="px-5 py-3 font-semibold text-stone-800">
                  {service.serviceName}
                </td>

                <td className="px-5 py-3 text-right font-bold text-stone-900">
                  {formatNumber(service.count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )}
</section>


);
}

function DashboardSkeleton() {
return ( <div className="mx-auto w-full max-w-[1600px] animate-pulse space-y-7 p-4 sm:p-6 lg:p-8"> <div className="h-36 rounded-3xl bg-emerald-950/10" />


  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="h-32 rounded-2xl border border-stone-100 bg-white"
      />
    ))}
  </div>

  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="h-32 rounded-2xl bg-stone-100" />
    ))}
  </div>

  <div className="grid gap-5 lg:grid-cols-2">
    <div className="h-72 rounded-2xl bg-stone-100" />
    <div className="h-72 rounded-2xl bg-stone-100" />
  </div>
</div>


);
}

function DashboardError({ message, onRetry }) {
return ( <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center p-6"> <div className="w-full rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm sm:p-10"> <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"> <AlertTriangle className="h-7 w-7" /> </span>


    <h2 className="mt-5 text-xl font-bold text-stone-900">
      Unable to load the executive dashboard
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

function ExecutiveDashboardPage() {
const [summary, setSummary] = useState(null);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState(null);
const [lastUpdated, setLastUpdated] = useState(null);

const load = useCallback(async (isBackgroundRefresh = false) => {
if (isBackgroundRefresh) {
setRefreshing(true);
}


try {
  const data = await getExecutiveSummary();

  setSummary(data);
  setError(null);
  setLastUpdated(data?.generatedAt || new Date().toISOString());
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't load the executive summary."
  );
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

if (loading && !summary) {
return <DashboardSkeleton />;
}

if (error && !summary) {
return (
<DashboardError
message={error}
onRetry={() => load()}
/>
);
}

if (!summary) {
return (
<DashboardError
message="No executive summary data was returned."
onRetry={() => load()}
/>
);
}

const extras = summary.summary || {};

const liveMetrics = [
{
label: "Customers Waiting",
value: summary.live.customersWaiting,
accent: "gold",
},
{
label: "Being Served",
value: summary.live.customersServing,
accent: "forest",
},
{
label: "Active Staff",
value: summary.live.activeStaffCount,
},
{
label: "Open Counters",
value: summary.live.activeCounters,
},
];

const todayMetrics = [
{
label: "Customers Completed",
value: summary.today.customersCompleted,
accent: "forest",
},
{
label: "Average Waiting Time",
value: formatDuration(summary.today.averageWaitTimeSeconds),
},
{
label: "Average Service Time",
value: formatDuration(summary.today.averageServiceTimeSeconds),
},
{
label: "Revenue",
value: formatCurrency(summary.today.revenue),
accent: "gold",
},
];

const updatedTime = lastUpdated
? new Date(lastUpdated).toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit",
})
: "—";

return ( <main className="mx-auto w-full max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">
{/* Executive header */} <header className="relative overflow-hidden rounded-3xl bg-emerald-950 px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9"> <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10" /> <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" /> <div className="pointer-events-none absolute -bottom-20 right-1/4 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />


    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
          <Gauge className="h-3.5 w-3.5" />
          Executive overview
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Executive Dashboard
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100/80 sm:text-base">
          Monitor performance across your branches, review business
          growth, and identify areas that need attention.
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
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>

    {error && (
      <div
        role="status"
        className="relative mt-5 flex items-start gap-2 rounded-xl border border-amber-200/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          The latest refresh failed. Showing the last successfully loaded
          data. {error}
        </span>
      </div>
    )}
  </header>

  {/* Branch alerts */}
  <section>
    <SectionHeading
      eyebrow="Operational monitoring"
      title="Branch alerts"
      description="Review branches that may need operational support."
      icon={AlertTriangle}
    />

    <AlertsPanel alerts={summary.alerts || []} />
  </section>

  {/* Live metrics */}
  <section>
    <SectionHeading
      eyebrow="Real-time overview"
      title="Live right now"
      description="Current queue and staffing activity across your business."
      icon={Activity}
    />

    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {liveMetrics.map((metric) => (
        <StatCard
          key={metric.label}
          label={metric.label}
          value={formatNumber(metric.value)}
          accent={metric.accent}
        />
      ))}
    </div>
  </section>

  {/* Today's metrics */}
  <section>
    <SectionHeading
      eyebrow="Daily operations"
      title="Today's performance"
      description="A snapshot of completed work, service times, and revenue."
      icon={TrendingUp}
    />

    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {todayMetrics.map((metric) => (
        <StatCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          accent={metric.accent}
        />
      ))}
    </div>
  </section>

  {/* Executive insights */}
  <section>
    <SectionHeading
      eyebrow="Business intelligence"
      title="Executive summary"
      description="Key growth indicators and leading performance areas."
      icon={BarChart3}
    />

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      <SummaryCard
        label="Weekly Growth"
        value={
          <GrowthValue percent={extras.weeklyGrowthPercent} />
        }
        detail="Booking growth compared with last week."
        icon={TrendingUp}
        accent="emerald"
      />

      <SummaryCard
        label="Monthly Growth"
        value={
          <GrowthValue percent={extras.monthlyGrowthPercent} />
        }
        detail="Booking growth compared with last month."
        icon={TrendingUp}
        accent="blue"
      />

      <SummaryCard
        label="Best Performing Branch"
        value={extras.bestBranch?.branchName || "—"}
        detail={
          extras.bestBranch
            ? `${formatNumber(extras.bestBranch.ticketsServedToday)} served today`
            : "No branch performance data available."
        }
        icon={Building2}
        accent="amber"
      />

      <SummaryCard
        label="Best Staff"
        value={extras.bestStaff?.name || "—"}
        detail={
          extras.bestStaff
            ? `${formatNumber(extras.bestStaff.completed)} completed today`
            : "No staff performance data available."
        }
        icon={UserCog}
        accent="violet"
      />

      <SummaryCard
        label="Most Requested Service"
        value={extras.mostRequestedService?.serviceName || "—"}
        detail={
          extras.mostRequestedService
            ? `${formatNumber(extras.mostRequestedService.count)} bookings today`
            : "No service request data available."
        }
        icon={CheckCircle2}
        accent="emerald"
      />

      <SummaryCard
        label="Highest Waiting Time"
        value={extras.highestWaitBranch?.branchName || "—"}
        detail={
          extras.lowestWaitBranch
            ? `Lowest wait: ${extras.lowestWaitBranch.branchName}`
            : "Lowest waiting-time data is unavailable."
        }
        icon={Clock}
        accent="rose"
      />
    </div>
  </section>

  {/* Branch ranking */}
  <section>
    <SectionHeading
      eyebrow="Multi-branch performance"
      title="Branch performance"
      description="Compare waiting customers, service activity, and staffing."
      icon={Building2}
    />

    {!summary.branchRanking?.length ? (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center">
        <Building2 className="mx-auto h-9 w-9 text-stone-300" />
        <p className="mt-3 text-sm font-semibold text-stone-800">
          No branch performance data
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Branch information will appear here when available.
        </p>
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summary.branchRanking.map((branch) => (
          <BranchCard key={branch.branchId} branch={branch} />
        ))}
      </div>
    )}
  </section>

  {/* Service ranking */}
  <section>
    <SectionHeading
      eyebrow="Service demand"
      title="Popular services"
      description="See which services are receiving the most bookings today."
      icon={Ticket}
    />

    <ServiceRanking services={summary.serviceRanking || []} />
  </section>

  {/* Help note */}
  <footer className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
      <CircleHelp className="h-5 w-5" />
    </span>

    <div>
      <p className="text-sm font-semibold text-emerald-950">
        Use your data to make better decisions
      </p>

      <p className="mt-1 text-sm leading-6 text-emerald-900/70">
        Monitor branch alerts, compare service performance, and review
        growth trends before deciding where to allocate staff or improve
        your queue operations.
      </p>
    </div>
  </footer>
</main>


);
}

export default ExecutiveDashboardPage;
