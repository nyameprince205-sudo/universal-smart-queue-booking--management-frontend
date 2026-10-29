import { useState, useEffect } from "react";
import {
CalendarDays,
Check,
ChevronRight,
Clock3,
RotateCcw,
} from "lucide-react";

function toDateInputValue(date) {
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0");
const day = String(date.getDate()).padStart(2, "0");

return `${year}-${month}-${day}`;
}

function daysAgo(n) {
const date = new Date();
date.setDate(date.getDate() - n);
return date;
}

const QUICK_RANGES = [
{ label: "Last 7 days", days: 7 },
{ label: "Last 30 days", days: 30 },
{ label: "Last 90 days", days: 90 },
];

function DateRangePicker({ onChange }) {
const [startDate, setStartDate] = useState(
toDateInputValue(daysAgo(30))
);
const [endDate, setEndDate] = useState(
toDateInputValue(new Date())
);
const [activeQuickRange, setActiveQuickRange] = useState(30);
const [error, setError] = useState("");

useEffect(() => {
onChange({
startDate,
endDate,
});
// Initialize the selected date range when the component mounts.
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

function applyQuickRange(days) {
const newStart = toDateInputValue(daysAgo(days));
const newEnd = toDateInputValue(new Date());


setStartDate(newStart);
setEndDate(newEnd);
setActiveQuickRange(days);
setError("");

onChange({
  startDate: newStart,
  endDate: newEnd,
});


}

function applyCustomRange(event) {
event.preventDefault();


if (!startDate || !endDate) {
  setError("Please select both a start date and an end date.");
  return;
}

if (startDate > endDate) {
  setError("The start date cannot be later than the end date.");
  return;
}

setActiveQuickRange(null);
setError("");

onChange({
  startDate,
  endDate,
});


}

function resetRange() {
applyQuickRange(30);
}

return ( <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
{/* Header */} <div className="mb-4 flex items-center justify-between gap-3"> <div className="flex items-center gap-3"> <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50"> <CalendarDays className="h-5 w-5 text-emerald-800" /> </div>


      <div>
        <h3 className="text-sm font-semibold text-stone-900">
          Date range
        </h3>
        <p className="mt-0.5 text-xs text-stone-500">
          Filter your analytics by date.
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={resetRange}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      title="Reset to the last 30 days"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Reset</span>
    </button>
  </div>

  {/* Quick ranges */}
  <div className="mb-5">
    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
      Quick select
    </p>

    <div className="flex flex-wrap gap-2">
      {QUICK_RANGES.map((range) => {
        const isActive = activeQuickRange === range.days;

        return (
          <button
            key={range.days}
            type="button"
            onClick={() => applyQuickRange(range.days)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
              isActive
                ? "border-emerald-800 bg-emerald-800 text-white shadow-sm"
                : "border-stone-200 bg-white text-stone-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900"
            }`}
          >
            {isActive ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Clock3 className="h-3.5 w-3.5" />
            )}
            {range.label}
          </button>
        );
      })}
    </div>
  </div>

  {/* Divider */}
  <div className="mb-5 border-t border-stone-100" />

  {/* Custom date range */}
  <form onSubmit={applyCustomRange}>
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        Custom range
      </p>
      <p className="mt-1 text-xs text-stone-500">
        Choose the exact dates you want to review.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
      <div>
        <label
          htmlFor="analytics-start-date"
          className="mb-1.5 block text-xs font-medium text-stone-600"
        >
          Start date
        </label>

        <input
          id="analytics-start-date"
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(event) => {
            setStartDate(event.target.value);
            setActiveQuickRange(null);
            setError("");
          }}
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        />
      </div>

      <div className="hidden items-center justify-center pb-3 sm:flex">
        <ChevronRight className="h-4 w-4 text-stone-400" />
      </div>

      <div>
        <label
          htmlFor="analytics-end-date"
          className="mb-1.5 block text-xs font-medium text-stone-600"
        >
          End date
        </label>

        <input
          id="analytics-end-date"
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) => {
            setEndDate(event.target.value);
            setActiveQuickRange(null);
            setError("");
          }}
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        />
      </div>
    </div>

    {/* Validation message */}
    {error && (
      <p
        role="alert"
        className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
      >
        {error}
      </p>
    )}

    {/* Apply button */}
    <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs leading-5 text-stone-500">
        Selected period:{" "}
        <span className="font-medium text-stone-700">
          {startDate || "No start date"} – {endDate || "No end date"}
        </span>
      </p>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        Apply date range
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </form>
</section>


);
}

export default DateRangePicker;
