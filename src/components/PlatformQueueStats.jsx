import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
const POLL_INTERVAL_MS = 15000;
function PlatformQueueStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      apiClient.get("/queue/platform-stats").then(res => {
        if (!cancelled) setStats(res.data);
      }).catch(() => {});
    };
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);
  if (!stats) return null;
  const busiest = stats.busiest || [];
  if (busiest.length === 0 && !stats.waitingNow) return null;
  return <section className="mt-10 max-w-xl mx-auto text-left" aria-labelledby="live-now-heading">
      <div className="bg-warm-ink rounded-xl p-5 sm:p-6 relative overflow-hidden">
        
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-warm-bg rounded-full" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-warm-bg rounded-full" />

        <div className="flex items-center justify-between">
          <h2 id="live-now-heading" className="text-xs uppercase tracking-wide text-gold-600 font-medium">
            Live right now
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            Updating
          </span>
        </div>

        {busiest.length > 0 ? <ul className="mt-4 space-y-3">
            {busiest.map(org => <li key={org.slug || org.name} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  {org.slug ? <Link to={`/book/${org.slug}`} className="text-sm font-medium text-white hover:text-gold-600 transition-colors truncate block">
                      {org.name}
                    </Link> : <span className="text-sm font-medium text-white truncate block">{org.name}</span>}
                  {org.businessType && <span className="text-xs text-white/40">{org.businessType}</span>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xl font-semibold text-white leading-none">
                    {org.waiting}
                  </p>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {org.waiting === 1 ? "person waiting" : "people waiting"}
                  </p>
                </div>
              </li>)}
          </ul> : <p className="mt-4 text-sm text-white/60">
            No queues running at the moment — a good time to book.
          </p>}

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/50">
            {stats.activeOrganizations}{" "}
            {stats.activeOrganizations === 1 ? "organization" : "organizations"} on SmartQueue
          </span>
          {stats.servedToday > 0 && <span className="text-white/50">{stats.servedToday} served today</span>}
        </div>
      </div>
    </section>;
}
export default PlatformQueueStats;