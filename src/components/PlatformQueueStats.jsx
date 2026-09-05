import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import apiClient from "../api/client";
const POLL_INTERVAL_MS = 15000;
function OrganizationRow({
  org
}) {
  const busy = org.waiting > 0;
  return <li className="flex items-center justify-between gap-4 py-3 border-b border-white/10 last:border-b-0">
      <div className="min-w-0">
        {org.slug ? <Link to={`/book/${org.slug}`} className="font-display text-lg text-white hover:text-gold-600 transition-colors truncate block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-600 rounded">
            {org.name}
          </Link> : <span className="font-display text-lg text-white truncate block">{org.name}</span>}
        {org.businessType && <span className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {org.businessType}
          </span>}
      </div>

      <div className="flex items-center gap-5 sm:gap-7 shrink-0">
        
        <div className="text-right hidden sm:block">
          <p className="text-[11px] text-white/50">Now serving</p>
          <p className="font-display text-lg text-white mt-0.5 leading-none">
            {org.nowServing || "—"}
          </p>
        </div>

        {busy ? <>
            <div className="text-right">
              <p className="text-[11px] text-white/50">Waiting</p>
              <p className="font-display text-2xl font-semibold text-gold-600 mt-0.5 leading-none">
                {org.waiting}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-white/50">Est. wait</p>
              <p className="font-display text-lg text-white mt-0.5 leading-none">
                {org.estimatedWaitMinutes >= 60 ? `${Math.floor(org.estimatedWaitMinutes / 60)}h ${org.estimatedWaitMinutes % 60}m` : `${org.estimatedWaitMinutes}m`}
              </p>
            </div>
          </> : <div className="text-right">
            <p className="font-display text-lg text-green-400 leading-none">No queue</p>
            <p className="text-[11px] text-white/50 mt-1">walk straight in</p>
          </div>}
      </div>
    </li>;
}
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
  const organizations = stats.busiest || [];
  if (organizations.length === 0) return null;
  return <section className="mt-12 max-w-2xl mx-auto text-left" aria-labelledby="live-board-heading">
      <div className="bg-warm-ink rounded-xl p-6 sm:p-8 relative overflow-hidden">
        
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-warm-bg rounded-full" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-warm-bg rounded-full" />

        <div className="flex items-center justify-between">
          <h2 id="live-board-heading" className="text-xs uppercase tracking-wide text-gold-600 font-medium">
            Live right now
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            Updating
          </span>
        </div>

        <ul className="mt-5">
          {organizations.map(org => <OrganizationRow key={org.slug || org.name} org={org} />)}
        </ul>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>
            {stats.waitingNow > 0 ? `${stats.waitingNow} waiting across the platform` : "Nobody waiting right now"}
          </span>
          {stats.servedToday > 0 && <span>{stats.servedToday} served today</span>}
        </div>
      </div>
    </section>;
}
export default PlatformQueueStats;