import { useState, useEffect } from "react";

// Local YYYY-MM-DD (not toISOString, which converts to UTC and can roll the
// date over to the next/previous day depending on the user's timezone —
// exactly the kind of off-by-one bug that's confusing to track down later).
function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const QUICK_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

// Reports report a `range` back in every response (see report.controller.js)
// so this component is deliberately "dumb" — it just reports {startDate,
// endDate} up to whichever parent is fetching a report; it doesn't know or
// care which report that is.
function DateRangePicker({ onChange }) {
  const [startDate, setStartDate] = useState(toDateInputValue(daysAgo(30)));
  const [endDate, setEndDate] = useState(toDateInputValue(new Date()));
  const [activeQuickRange, setActiveQuickRange] = useState(30);

  // Without this, the parent (e.g. DashboardPage) never learns what range
  // is active until the user clicks something — meaning the page would
  // render with no data at all until then. Firing once on mount means the
  // default 30-day range shown in this component is ALSO the range whatever
  // report the parent fetches, from the very first render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onChange({ startDate, endDate });
  }, []);

  function applyQuickRange(days) {
    const newStart = toDateInputValue(daysAgo(days));
    const newEnd = toDateInputValue(new Date());
    setStartDate(newStart);
    setEndDate(newEnd);
    setActiveQuickRange(days);
    onChange({ startDate: newStart, endDate: newEnd });
  }

  function applyCustomRange() {
    setActiveQuickRange(null);
    onChange({ startDate, endDate });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {QUICK_RANGES.map((range) => (
        <button
          key={range.days}
          onClick={() => applyQuickRange(range.days)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeQuickRange === range.days
              ? "bg-slate-800 text-white"
              : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          {range.label}
        </button>
      ))}

      <div className="flex items-center gap-2 ml-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700"
        />
        <span className="text-slate-400 text-sm">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700"
        />
        <button
          onClick={applyCustomRange}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-sky-600 text-white hover:bg-sky-500 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export default DateRangePicker;
