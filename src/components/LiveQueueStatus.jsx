import { useEffect, useState, useCallback } from "react";
import {
Users,
Clock,
Radio,
Activity,
RefreshCw,
Timer,
ArrowRight,
} from "lucide-react";
import apiClient from "../api/client";

const POLL_INTERVAL_MS = 10000;

const BUSYNESS_STYLES = {
quiet: {
dot: "bg-emerald-500",
label: "No queue",
text: "text-emerald-700",
bg: "bg-emerald-50",
border: "border-emerald-200",
badge: "bg-emerald-100",
accent: "text-emerald-700",
},
moderate: {
dot: "bg-amber-500",
label: "Moderate",
text: "text-amber-700",
bg: "bg-amber-50",
border: "border-amber-200",
badge: "bg-amber-100",
accent: "text-amber-700",
},
busy: {
dot: "bg-red-500",
label: "Busy",
text: "text-red-700",
bg: "bg-red-50",
border: "border-red-200",
badge: "bg-red-100",
accent: "text-red-700",
},
};

function formatWait(minutes) {
const value = Number(minutes);

if (!Number.isFinite(value) || value < 0) {
return "Calculating";
}

if (value < 60) {
return `${value} min`;
}

const hours = Math.floor(value / 60);
const remainingMinutes = value % 60;

return remainingMinutes === 0
? `${hours} hr`
: `${hours} hr ${remainingMinutes} min`;
}

function MetricCard({ icon: Icon, label, value, accent = "text-stone-900" }) {
return ( <div className="rounded-xl border border-stone-100 bg-white p-3 sm:p-4"> <div className="flex items-center gap-2 text-stone-500"> <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100"> <Icon className="h-3.5 w-3.5" aria-hidden="true" /> </span>


    <span className="text-xs font-medium leading-tight">{label}</span>
  </div>

  <p
    className={`mt-3 break-words text-xl font-bold tracking-tight sm:text-2xl ${accent}`}
  >
    {value ?? "—"}
  </p>
</div>


);
}

function BranchStatus({ branch, showName }) {
const style =
BUSYNESS_STYLES[branch.busyness] || BUSYNESS_STYLES.moderate;

return (
<article
className={`overflow-hidden rounded-2xl border ${style.border} bg-white shadow-sm transition-all duration-200 hover:shadow-md`}
aria-label={
showName
? `Queue status for ${branch.branchName}`
: "Current queue status"
}
>
{/* Branch header */}
<div className={`${style.bg} border-b ${style.border} px-4 py-4 sm:px-5`}> <div className="flex items-start justify-between gap-3"> <div className="min-w-0">
{showName && ( <h3 className="truncate text-base font-bold text-stone-900 sm:text-lg">
{branch.branchName} </h3>
)}


        <div className={`flex items-center gap-2 ${showName ? "mt-2" : ""}`}>
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full ${style.dot} opacity-30`}
              aria-hidden="true"
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${style.dot}`}
              aria-hidden="true"
            />
          </span>

          <span className={`text-sm font-semibold ${style.text}`}>
            {style.label}
          </span>
        </div>
      </div>

      <span
        className={`flex shrink-0 items-center gap-1.5 rounded-full ${style.badge} px-2.5 py-1 text-xs font-semibold ${style.text}`}
      >
        <Activity className="h-3.5 w-3.5" aria-hidden="true" />
        Live status
      </span>
    </div>
  </div>

  {/* Queue metrics */}
  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
    <MetricCard
      icon={Users}
      label="People waiting"
      value={branch.waiting ?? 0}
    />

    <MetricCard
      icon={Timer}
      label="Estimated wait"
      value={formatWait(branch.estimatedWaitMinutes)}
      accent="text-amber-700"
    />

    <MetricCard
      icon={Radio}
      label="Now serving"
      value={branch.nowServing || "—"}
      accent="text-emerald-700"
    />
  </div>

  {/* Queue footer */}
  <div className="flex items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/70 px-4 py-3 sm:px-5">
    <div className="flex items-center gap-2 text-xs text-stone-500">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Automatically refreshes every 10 seconds</span>
    </div>

    <ArrowRight
      className="h-4 w-4 shrink-0 text-stone-400"
      aria-hidden="true"
    />
  </div>
</article>


);
}

function LiveQueueStatus({ slug }) {
const [data, setData] = useState(null);
const [failed, setFailed] = useState(false);
const [lastUpdated, setLastUpdated] = useState(null);

const load = useCallback(async () => {
try {
const res = await apiClient.get(`/queue/status/${slug}`);


  setData(res.data);
  setFailed(false);
  setLastUpdated(new Date());
} catch {
  setFailed(true);
}


}, [slug]);

useEffect(() => {
load();


const intervalId = setInterval(load, POLL_INTERVAL_MS);

return () => clearInterval(intervalId);


}, [load]);

// Preserve the existing behaviour: do not show this section
// if the endpoint fails or no branches are returned.
if (failed || !data || !Array.isArray(data.branches) || data.branches.length === 0) {
return null;
}

const multipleBranches = data.branches.length > 1;

return ( <section
   className="mb-8"
   aria-labelledby="live-queue-heading"
   aria-live="polite"
 >
{/* Section heading */} <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"> <div> <div className="flex items-center gap-2"> <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"> <Radio className="h-4 w-4" aria-hidden="true" /> </span>


        <h2
          id="live-queue-heading"
          className="text-lg font-bold tracking-tight text-stone-900 sm:text-xl"
        >
          Queue right now
        </h2>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        Check current waiting times before visiting.
      </p>
    </div>

    {/* Live indicator */}
    <div className="flex items-center justify-between gap-3 self-start rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 sm:self-auto">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40"
            aria-hidden="true"
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"
            aria-hidden="true"
          />
        </span>

        <span className="text-xs font-semibold text-emerald-800">
          Auto-refresh enabled
        </span>
      </div>

      <RefreshCw
        className="h-3.5 w-3.5 text-emerald-700"
        aria-hidden="true"
      />
    </div>
  </div>

  {/* Branch status cards */}
  <div
    className={
      multipleBranches
        ? "grid grid-cols-1 gap-4 lg:grid-cols-2"
        : "grid grid-cols-1"
    }
  >
    {data.branches.map((branch) => (
      <BranchStatus
        key={branch.branchId}
        branch={branch}
        showName={multipleBranches}
      />
    ))}
  </div>

  {/* Last updated */}
  {lastUpdated && (
    <p className="mt-3 text-right text-xs text-stone-400">
      Last refreshed at{" "}
      {lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </p>
  )}
</section>


);
}

export default LiveQueueStatus;
