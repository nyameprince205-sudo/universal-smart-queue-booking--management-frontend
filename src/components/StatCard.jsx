const ACCENTS = {
  neutral: "border-t-warm-border",
  forest: "border-t-forest-600",
  gold: "border-t-gold-600",
  danger: "border-t-red-500"
};
const VALUE_COLORS = {
  neutral: "text-warm-ink",
  forest: "text-forest-600",
  gold: "text-gold-800",
  danger: "text-red-600"
};
function StatCard({
  label,
  value,
  accent = "neutral"
}) {
  const accentClass = ACCENTS[accent] || ACCENTS.neutral;
  const valueClass = VALUE_COLORS[accent] || VALUE_COLORS.neutral;
  return <div className={`bg-warm-card rounded-lg border border-warm-border card-accent ${accentClass} p-5`}>
      <p className="text-sm text-warm-muted">{label}</p>
      <p className={`font-display text-3xl font-semibold mt-1 ${valueClass}`}>{value}</p>
    </div>;
}
export default StatCard;