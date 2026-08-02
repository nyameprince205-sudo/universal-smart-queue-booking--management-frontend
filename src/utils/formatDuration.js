// Report endpoints return raw seconds (see report.controller.js) — this
// turns that into something a human actually reads at a glance. Picks the
// two largest relevant units rather than showing every unit down to
// seconds, since "1d 19h" is readable and "1d 19h 52m 1s" is noise.
function formatDuration(totalSeconds) {
  if (totalSeconds == null) return "—";
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export { formatDuration };
