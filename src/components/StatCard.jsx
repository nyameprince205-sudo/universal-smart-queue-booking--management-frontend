// Deliberately tiny and generic (label + value + optional hint) rather than
// building one bespoke card per metric — Step 3b/3c will likely want the
// same "big number in a box" treatment for other stats (e.g. active
// subscription status), so this is worth sharing now rather than
// duplicating the same div/classNames four times over.
function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default StatCard;
