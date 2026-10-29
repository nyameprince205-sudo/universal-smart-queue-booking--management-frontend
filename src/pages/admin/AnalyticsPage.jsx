import { useEffect, useState, useCallback } from "react";
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
} from "recharts";
import {
Activity,
TrendingUp,
Users,
Building2,
Wallet,
Clock3,
CalendarDays,
AlertCircle,
RefreshCw,
BarChart3,
CheckCircle2,
CircleDollarSign,
UserRound,
ArrowUpRight,
} from "lucide-react";

import {
getServicePopularity,
getPeakHours,
getBookingTrends,
getStaffPerformance,
getBranchComparison,
getRevenueReport,
} from "../../api/analytics";

import DateRangePicker from "../../components/DateRangePicker";
import StatCard from "../../components/StatCard";
import { formatDuration } from "../../utils/formatDuration";

const TABS = [
{ label: "Overview", icon: Activity },
{ label: "Trends", icon: TrendingUp },
{ label: "Staff & Branches", icon: Users },
{ label: "Revenue", icon: Wallet },
];

const GRANULARITIES = ["day", "week", "month", "year"];

const CHART_COLORS = {
emerald: "#047857",
gold: "#D97706",
grid: "#E2E8F0",
muted: "#64748B",
};

const TOOLTIP_STYLE = {
borderRadius: "12px",
border: "1px solid #E2E8F0",
boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
padding: "10px 14px",
};

function LoadingState({ message = "Loading analytics..." }) {
return ( <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center"> <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50"> <RefreshCw
       className="h-5 w-5 animate-spin text-emerald-700"
       aria-hidden="true"
     /> </div> <p className="mt-4 text-sm font-semibold text-slate-800">{message}</p> <p className="mt-1 text-xs text-slate-500">
Please wait while your report is prepared. </p> </div>
);
}

function ErrorState({ message, onRetry }) {
return ( <div
   role="alert"
   className="mt-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
 > <div className="flex items-start gap-3"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700"> <AlertCircle className="h-5 w-5" aria-hidden="true" /> </div>


    <div>
      <p className="text-sm font-semibold text-red-900">
        Unable to load analytics
      </p>
      <p className="mt-1 text-sm leading-6 text-red-700">{message}</p>
    </div>
  </div>

  {onRetry && (
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
      Try again
    </button>
  )}
</div>


);
}

function SectionCard({ title, subtitle, icon: Icon, children, className = "" }) {
return (
<section
className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
> <div className="flex items-start gap-3 px-5 pb-4 pt-5 sm:px-6">
{Icon && ( <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"> <Icon className="h-5 w-5" aria-hidden="true" /> </div>
)}


    <div className="min-w-0">
      <h2 className="text-sm font-bold text-slate-900 sm:text-base">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
          {subtitle}
        </p>
      )}
    </div>
  </div>

  <div className="px-4 pb-5 sm:px-6">{children}</div>
</section>


);
}

function EmptyState({ message = "No data available for this date range." }) {
return ( <div className="flex min-h-32 flex-col items-center justify-center px-4 py-8 text-center"> <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400"> <BarChart3 className="h-5 w-5" aria-hidden="true" /> </div> <p className="mt-3 text-sm font-medium text-slate-700">
Nothing to show yet </p> <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
{message} </p> </div>
);
}

function ChartLoading({ message = "Loading chart..." }) {
return ( <div className="flex h-64 items-center justify-center"> <div className="flex items-center gap-2 text-sm text-slate-500"> <RefreshCw
       className="h-4 w-4 animate-spin text-emerald-700"
       aria-hidden="true"
     />
{message} </div> </div>
);
}

function ChartError({ message, onRetry }) {
return ( <div
   role="alert"
   className="flex min-h-48 flex-col items-center justify-center px-4 py-8 text-center"
 > <AlertCircle
     className="h-7 w-7 text-red-500"
     aria-hidden="true"
   /> <p className="mt-3 text-sm font-semibold text-slate-800">
Couldn't load this chart </p> <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
{message} </p> <button
     type="button"
     onClick={onRetry}
     className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
   > <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
Retry </button> </div>
);
}

function useAnalyticsRequest(request, dependencies, fallbackMessage) {
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [retryKey, setRetryKey] = useState(0);

const retry = useCallback(() => {
setRetryKey((key) => key + 1);
}, []);

useEffect(() => {
if (!dependencies.every((value) => value != null)) {
setLoading(false);
return;
}


let active = true;

setLoading(true);
setError(null);

request()
  .then((result) => {
    if (active) setData(result);
  })
  .catch((err) => {
    if (active) {
      setError(
        err.response?.data?.error || fallbackMessage
      );
    }
  })
  .finally(() => {
    if (active) setLoading(false);
  });

return () => {
  active = false;
};
// dependencies is deliberately supplied by each caller.
// eslint-disable-next-line react-hooks/exhaustive-deps


}, [...dependencies, retryKey]);

return { data, loading, error, retry };
}

function OverviewTab({ filters }) {
const request = useCallback(
() =>
Promise.all([
getPeakHours(filters),
getServicePopularity(filters),
]),
[filters]
);

const {
data,
loading,
error,
retry,
} = useAnalyticsRequest(
request,
[filters],
"Couldn't load overview data."
);

if (!filters) return <LoadingState message="Preparing your report..." />;
if (loading) return <LoadingState />;
if (error) return <ErrorState message={error} onRetry={retry} />;
if (!data) return null;

const [peakHours, servicesData] = data;
const services = servicesData?.services || [];
const mostPopular = services.slice(0, 5);
const leastPopular = services.slice(-5).reverse();

return ( <div className="mt-6 space-y-6"> <SectionCard
     title="Peak hours"
     subtitle="Ticket volume by hour of the day"
     icon={Clock3}
   >
{peakHours?.byHour?.length ? ( <div className="h-64 w-full"> <ResponsiveContainer width="100%" height="100%">
<BarChart
data={peakHours.byHour}
margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
> <CartesianGrid
               strokeDasharray="3 3"
               stroke={CHART_COLORS.grid}
               vertical={false}
             />
<XAxis
dataKey="hour"
tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
tickLine={false}
axisLine={{ stroke: CHART_COLORS.grid }}
interval="preserveStartEnd"
/>
<YAxis
allowDecimals={false}
tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
tickLine={false}
axisLine={false}
/>
<Tooltip
contentStyle={TOOLTIP_STYLE}
labelFormatter={(hour) => `${hour}:00`}
formatter={(value) => [value, "Tickets"]}
/>
<Bar
dataKey="ticketCount"
name="Tickets"
fill={CHART_COLORS.emerald}
radius={[5, 5, 0, 0]}
maxBarSize={34}
/> </BarChart> </ResponsiveContainer> </div>
) : ( <EmptyState message="There is no peak-hour data for the selected period." />
)} </SectionCard>


  <div className="grid gap-6 lg:grid-cols-2">
    <SectionCard
      title="Most requested services"
      subtitle="Services with the highest booking counts"
      icon={TrendingUp}
    >
      {mostPopular.length === 0 ? (
        <EmptyState message="No bookings were recorded in this date range." />
      ) : (
        <div className="space-y-4">
          {mostPopular.map((service, index) => {
            const maxCount = Math.max(
              ...mostPopular.map((item) => item.bookingCount || 0),
              1
            );

            return (
              <div key={service.serviceId}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-800">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-sm font-medium text-slate-700">
                      {service.serviceName}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-slate-900">
                    {service.bookingCount}
                  </span>
                </div>
                <div className="ml-11 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{
                      width: `${Math.min(
                        ((service.bookingCount || 0) / maxCount) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>

    <SectionCard
      title="Least requested services"
      subtitle="Services with the lowest booking counts"
      icon={Activity}
    >
      {leastPopular.length === 0 ? (
        <EmptyState message="No service booking data is available for this period." />
      ) : (
        <div className="space-y-4">
          {leastPopular.map((service, index) => (
            <div
              key={service.serviceId}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                  <Activity className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {service.serviceName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Service {index + 1}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                {service.bookingCount}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  </div>
</div>


);
}

function TrendsTab({ filters }) {
const [granularity, setGranularity] = useState("week");

const request = useCallback(
() => getBookingTrends({ ...filters, granularity }),
[filters, granularity]
);

const {
data: trend,
loading,
error,
retry,
} = useAnalyticsRequest(
request,
[filters, granularity],
"Couldn't load booking trends."
);

return ( <div className="mt-6 space-y-5"> <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"> <div> <h2 className="text-base font-bold text-slate-900">
Booking trends </h2> <p className="mt-1 text-sm text-slate-500">
Understand how booking activity changes over time. </p> </div>


    <div
      className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1"
      aria-label="Trend time interval"
    >
      {GRANULARITIES.map((granularityOption) => (
        <button
          key={granularityOption}
          type="button"
          aria-pressed={granularity === granularityOption}
          onClick={() => setGranularity(granularityOption)}
          className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors ${
            granularity === granularityOption
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {granularityOption}
        </button>
      ))}
    </div>
  </div>

  {loading && <LoadingState message="Loading booking trends..." />}
  {error && <ErrorState message={error} onRetry={retry} />}

  {!loading && !error && trend && (
    <SectionCard
      title="Booking activity"
      subtitle={`Bookings grouped by ${granularity}`}
      icon={TrendingUp}
    >
      {trend.trend?.length ? (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trend.trend}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [value, "Bookings"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Bookings"
                stroke={CHART_COLORS.emerald}
                strokeWidth={3}
                dot={{
                  r: 3,
                  fill: CHART_COLORS.emerald,
                  strokeWidth: 0,
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState message="No bookings were recorded for the selected period." />
      )}
    </SectionCard>
  )}
</div>


);
}

function StaffBranchesTab({ filters }) {
const request = useCallback(
() =>
Promise.all([
getStaffPerformance(filters),
getBranchComparison(filters),
]),
[filters]
);

const {
data,
loading,
error,
retry,
} = useAnalyticsRequest(
request,
[filters],
"Couldn't load staff and branch reports."
);

if (!filters) return <LoadingState message="Preparing your report..." />;
if (loading) return <LoadingState />;
if (error) return <ErrorState message={error} onRetry={retry} />;
if (!data) return null;

const [staffData, branchData] = data;
const staff = staffData?.staff || [];
const branches = branchData?.branches || [];

return ( <div className="mt-6 space-y-6"> <SectionCard
     title="Staff performance"
     subtitle="Review ticket handling and service completion"
     icon={Users}
   >
{staff.length === 0 ? ( <EmptyState message="No staff performance data is available. Your backend may require tickets to be called after staff attribution was enabled." />
) : (
<>
{/* Mobile layout */} <div className="space-y-3 sm:hidden">
{staff.map((member) => ( <div
               key={member.userId}
               className="rounded-xl border border-slate-200 p-4"
             > <div className="flex items-center gap-3"> <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"> <UserRound className="h-5 w-5" aria-hidden="true" /> </div> <div> <p className="text-sm font-bold text-slate-900">
{member.name} </p> <p className="mt-0.5 text-xs text-slate-500">
Staff performance </p> </div> </div>


              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="Handled" value={member.ticketsHandled} />
                <Metric label="Completed" value={member.completed} />
                <Metric label="Missed" value={member.missed} />
                <Metric
                  label="Average service"
                  value={formatDuration(member.averageServiceTimeSeconds)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop and tablet table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Staff member</th>
                <th className="px-4 py-3 font-semibold">Handled</th>
                <th className="px-4 py-3 font-semibold">Completed</th>
                <th className="px-4 py-3 font-semibold">Missed</th>
                <th className="px-4 py-3 font-semibold">
                  Avg. service time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => (
                <tr
                  key={member.userId}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {member.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {member.ticketsHandled}
                  </td>
                  <td className="px-4 py-4 font-medium text-emerald-700">
                    {member.completed}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {member.missed}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {formatDuration(member.averageServiceTimeSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </SectionCard>

  <SectionCard
    title="Branch comparison"
    subtitle="Compare booking volume, service and no-show rates"
    icon={Building2}
  >
    {branches.length === 0 ? (
      <EmptyState message="No branch comparison data is available for the selected period." />
    ) : (
      <>
        {/* Mobile layout */}
        <div className="space-y-3 sm:hidden">
          {branches.map((branch) => (
            <div
              key={branch.branchId}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {branch.branchName}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="Bookings" value={branch.totalBookings} />
                <Metric label="Tickets served" value={branch.ticketsServed} />
                <Metric
                  label="Average wait"
                  value={formatDuration(branch.averageWaitTimeSeconds)}
                />
                <Metric
                  label="No-show rate"
                  value={`${branch.noShowRatePercent}%`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop and tablet table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Branch</th>
                <th className="px-4 py-3 font-semibold">Bookings</th>
                <th className="px-4 py-3 font-semibold">Tickets served</th>
                <th className="px-4 py-3 font-semibold">Average wait</th>
                <th className="px-4 py-3 font-semibold">No-show rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map((branch) => (
                <tr
                  key={branch.branchId}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {branch.branchName}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {branch.totalBookings}
                  </td>
                  <td className="px-4 py-4 font-medium text-emerald-700">
                    {branch.ticketsServed}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {formatDuration(branch.averageWaitTimeSeconds)}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {branch.noShowRatePercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </SectionCard>
</div>


);
}

function Metric({ label, value }) {
return ( <div className="rounded-xl bg-slate-50 p-3"> <p className="text-xs text-slate-500">{label}</p> <p className="mt-1 break-words text-sm font-bold text-slate-900">
{value ?? "—"} </p> </div>
);
}

function RevenueTab({ filters }) {
const request = useCallback(
() => getRevenueReport(filters),
[filters]
);

const {
data: revenue,
loading,
error,
retry,
} = useAnalyticsRequest(
request,
[filters],
"Couldn't load the revenue report."
);

if (!filters) return <LoadingState message="Preparing your report..." />;
if (loading) return <LoadingState message="Loading revenue report..." />;
if (error) return <ErrorState message={error} onRetry={retry} />;
if (!revenue) return null;

const totalRevenue = Number(revenue.totalRevenue) || 0;
const byService = revenue.byService || [];
const byDay = revenue.byDay || [];

return ( <div className="mt-6 space-y-6"> <div className="grid gap-5 sm:grid-cols-2"> <div className="relative overflow-hidden rounded-2xl bg-emerald-800 p-6 text-white shadow-sm sm:col-span-2 lg:p-8"> <div
         aria-hidden="true"
         className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[32px] border-white/5"
       /> <div className="relative"> <div className="flex items-center gap-2 text-sm font-medium text-emerald-100"> <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
Total recorded revenue </div>


        <p className="mt-4 break-words text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          GHS{" "}
          {totalRevenue.toLocaleString("en-GH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>

        <p className="mt-3 text-sm text-emerald-100/80">
          Based on the selected reporting period.
        </p>
      </div>
    </div>
  </div>

  <SectionCard
    title="Revenue by service"
    subtitle="Compare recorded revenue across services"
    icon={Wallet}
  >
    {byService.length === 0 ? (
      <EmptyState message="No completed bookings with revenue were found in this period." />
    ) : (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={byService}
            margin={{ top: 8, right: 8, left: -10, bottom: 35 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
            <XAxis
              dataKey="serviceName"
              tick={{
                fontSize: 10,
                fill: CHART_COLORS.muted,
              }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                Number(value).toLocaleString("en-GH")
              }
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [
                `GHS ${Number(value).toLocaleString("en-GH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                "Revenue",
              ]}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill={CHART_COLORS.emerald}
              radius={[5, 5, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </SectionCard>

  <SectionCard
    title="Revenue by day"
    subtitle="Track daily revenue throughout the selected period"
    icon={CalendarDays}
  >
    {byDay.length === 0 ? (
      <EmptyState message="No daily revenue data is available for this period." />
    ) : (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={byDay}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: CHART_COLORS.muted }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                Number(value).toLocaleString("en-GH")
              }
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [
                `GHS ${Number(value).toLocaleString("en-GH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                "Revenue",
              ]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={CHART_COLORS.emerald}
              strokeWidth={3}
              dot={{
                r: 3,
                fill: CHART_COLORS.emerald,
                strokeWidth: 0,
              }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </SectionCard>
</div>


);
}

function AnalyticsPage() {
const [activeTab, setActiveTab] = useState("Overview");
const [filters, setFilters] = useState(null);

const handleRangeChange = useCallback((newFilters) => {
setFilters(newFilters);
}, []);

return ( <main className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8"> <div className="mx-auto max-w-screen-2xl">
{/* Page heading */} <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"> <div> <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700"> <span className="h-2 w-2 rounded-full bg-emerald-600" />
Business intelligence </div>


        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Analytics & Reports
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Understand queue activity, booking trends, staff performance,
          branch operations and recorded revenue.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
          <CalendarDays
            className="h-4 w-4 text-emerald-700"
            aria-hidden="true"
          />
          Reporting period
        </span>
        <DateRangePicker onChange={handleRangeChange} />
      </div>
    </div>

    {/* Navigation */}
    <div className="mt-8 border-b border-slate-200">
      <nav
        className="-mb-px flex gap-1 overflow-x-auto"
        aria-label="Analytics sections"
      >
        {TABS.map(({ label, icon: Icon }) => {
          const isActive = activeTab === label;

          return (
            <button
              key={label}
              type="button"
              onClick={() => setActiveTab(label)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors sm:px-5 ${
                isActive
                  ? "border-emerald-700 text-emerald-800"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </nav>
    </div>

    {/* Tab content */}
    <div className="pb-10">
      {activeTab === "Overview" && (
        <OverviewTab filters={filters} />
      )}

      {activeTab === "Trends" && (
        <TrendsTab filters={filters} />
      )}

      {activeTab === "Staff & Branches" && (
        <StaffBranchesTab filters={filters} />
      )}

      {activeTab === "Revenue" && (
        <RevenueTab filters={filters} />
      )}
    </div>

    {/* Footer note */}
    <div className="flex items-start gap-2 border-t border-slate-200 py-5 text-xs leading-5 text-slate-500">
      <Activity
        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
        aria-hidden="true"
      />
      <p>
        Reports reflect the data returned by your system for the selected
        date range. Revenue and performance figures depend on the accuracy
        of the underlying booking and ticket records.
      </p>
    </div>
  </div>
</main>


);
}

export default AnalyticsPage;
