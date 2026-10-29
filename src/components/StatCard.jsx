const ACCENTS = {
neutral: {
border: "border-t-slate-300",
value: "text-slate-900",
iconBg: "bg-slate-100",
iconText: "text-slate-600",
dot: "bg-slate-400",
},
forest: {
border: "border-t-emerald-600",
value: "text-emerald-700",
iconBg: "bg-emerald-50",
iconText: "text-emerald-700",
dot: "bg-emerald-500",
},
gold: {
border: "border-t-amber-500",
value: "text-amber-700",
iconBg: "bg-amber-50",
iconText: "text-amber-700",
dot: "bg-amber-500",
},
danger: {
border: "border-t-red-500",
value: "text-red-600",
iconBg: "bg-red-50",
iconText: "text-red-600",
dot: "bg-red-500",
},
};

function StatCard({
label,
value,
accent = "neutral",
description,
}) {
const theme = ACCENTS[accent] || ACCENTS.neutral;

return (
<div
className={`group relative overflow-hidden rounded-2xl border border-slate-200 border-t-4 ${theme.border} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6`}
>
{/* Decorative background accent */}
<div
aria-hidden="true"
className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${theme.iconBg} opacity-70 transition-transform duration-300 group-hover:scale-125`}
/>


  <div className="relative">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium leading-5 text-slate-500">
        {label}
      </p>

      <span
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${theme.dot}`}
        aria-hidden="true"
      />
    </div>

    <p
      className={`mt-4 break-words text-3xl font-bold tracking-tight ${theme.value} sm:text-4xl`}
    >
      {value ?? "—"}
    </p>

    {description && (
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    )}
  </div>
</div>


);
}

export default StatCard;
