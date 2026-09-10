import { useState } from "react";
const RANGES = [{
  key: "today",
  label: "Today"
}, {
  key: "yesterday",
  label: "Yesterday"
}, {
  key: "this_week",
  label: "This Week"
}, {
  key: "last_week",
  label: "Last Week"
}, {
  key: "this_month",
  label: "This Month"
}, {
  key: "last_month",
  label: "Last Month"
}, {
  key: "all",
  label: "All"
}];
function BookingDateFilter({
  value,
  onChange
}) {
  return <div className="flex gap-2 flex-wrap">
      {RANGES.map(r => <button key={r.key} onClick={() => onChange(r.key)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${value === r.key ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
          {r.label}
        </button>)}
    </div>;
}
BookingDateFilter.DEFAULT_RANGE = "today";
export default BookingDateFilter;