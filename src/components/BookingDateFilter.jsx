import { CalendarDays, Check } from "lucide-react";

const RANGES = [
{ key: "today", label: "Today" },
{ key: "yesterday", label: "Yesterday" },
{ key: "this_week", label: "This Week" },
{ key: "last_week", label: "Last Week" },
{ key: "this_month", label: "This Month" },
{ key: "last_month", label: "Last Month" },
{ key: "all", label: "All Time" },
];

function BookingDateFilter({ value, onChange }) {
return ( <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"> <div className="mb-3 flex items-center gap-2"> <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50"> <CalendarDays className="h-4 w-4 text-emerald-800" /> </div>


    <div>
      <h3 className="text-sm font-semibold text-stone-900">
        Filter bookings
      </h3>
      <p className="text-xs text-stone-500">
        Choose a date range to view bookings.
      </p>
    </div>
  </div>

  <div
    className="flex flex-wrap gap-2"
    role="group"
    aria-label="Filter bookings by date"
  >
    {RANGES.map((range) => {
      const isActive = value === range.key;

      return (
        <button
          key={range.key}
          type="button"
          onClick={() => onChange(range.key)}
          aria-pressed={isActive}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
            isActive
              ? "border-emerald-800 bg-emerald-800 text-white shadow-sm"
              : "border-stone-200 bg-white text-stone-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900"
          }`}
        >
          {isActive && <Check className="h-3.5 w-3.5" />}
          {range.label}
        </button>
      );
    })}
  </div>
</div>


);
}

BookingDateFilter.DEFAULT_RANGE = "today";

export default BookingDateFilter;


