// "5 minutes ago" style formatting for the activity feed — durable phrasing
// rather than an absolute timestamp that goes stale-looking the moment
// someone glances back at the page a minute later.
function formatRelativeTime(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export { formatRelativeTime };
