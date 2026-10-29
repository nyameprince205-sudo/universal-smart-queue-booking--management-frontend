
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Users,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import apiClient from "../api/client";

const POLL_INTERVAL_MS = 15000;

/*
 * Shared hover effect:
 * Cards shrink slightly when hovered on devices with a mouse.
 * Touchscreens and reduced-motion preferences are respected.
 */
const CARD_HOVER =
  "transition-[transform,box-shadow,border-color] duration-300 ease-out motion-reduce:transition-none [@media(hover:hover)]:hover:scale-[0.97]";

function formatWait(minutes) {
  const value = Number(minutes);

  if (!Number.isFinite(value) || value < 0) {
    return "Calculating";
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const remainingMinutes = value % 60;

  return remainingMinutes === 0
    ? `${hours} hr`
    : `${hours} hr ${remainingMinutes} min`;
}

function OrganizationRow({ org, index }) {
  const waiting = Math.max(0, Number(org.waiting) || 0);
  const busy = waiting > 0;

  return (
    <li
      className={`group relative border-b border-white/10 last:border-b-0 ${CARD_HOVER}`}
    >
      <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Organization information */}
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-amber-300">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="min-w-0 flex-1">
            {org.slug ? (
              <Link
                to={`/book/${org.slug}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded text-base font-semibold text-white transition-colors hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:text-lg"
              >
                <span className="truncate">{org.name}</span>

                <ArrowUpRight
                  className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <h3 className="truncate text-base font-semibold text-white sm:text-lg">
                {org.name}
              </h3>
            )}

            {org.businessType && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                <MapPin
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />

                <span className="truncate">{org.businessType}</span>
              </p>
            )}
          </div>
        </div>

        {/* Queue information */}
        <div className="grid grid-cols-2 gap-3 pl-[52px] sm:flex sm:items-center sm:gap-6 sm:pl-0">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-white/45">
              Now serving
            </p>

            <p className="mt-1 truncate text-base font-semibold text-white">
              {org.nowServing || "—"}
            </p>
          </div>

          {busy ? (
            <>
              <div>
                <p className="text-[11px] font-medium text-white/45">
                  Waiting
                </p>

                <p className="mt-1 text-xl font-bold text-amber-300">
                  {waiting}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <p className="text-[11px] font-medium text-white/45">
                  Estimated wait
                </p>

                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white sm:text-base">
                  <Clock3
                    className="h-3.5 w-3.5 text-amber-300"
                    aria-hidden="true"
                  />

                  {formatWait(org.estimatedWaitMinutes)}
                </p>
              </div>
            </>
          ) : (
            <div className="col-span-1">
              <p className="text-[11px] font-medium text-white/45">
                Queue status
              </p>

              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                <CheckCircle2
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                No queue
              </span>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function PlatformQueueStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await apiClient.get("/queue/platform-stats");

        if (!cancelled) {
          setStats(response.data);
        }
      } catch {
        // Keep the most recently loaded statistics if a request fails.
      }
    }

    load();

    const intervalId = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  if (!stats) {
    return null;
  }

  const organizations = Array.isArray(stats.busiest)
    ? stats.busiest
    : [];

  if (organizations.length === 0) {
    return null;
  }

  const waitingNow = Math.max(0, Number(stats.waitingNow) || 0);
  const servedToday = Math.max(0, Number(stats.servedToday) || 0);

  return (
    <section
      className="mx-auto mt-14 max-w-3xl text-left sm:mt-16"
      aria-labelledby="live-board-heading"
    >
      {/* Main live statistics card */}
      <div
        className={`relative overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 shadow-xl shadow-stone-900/10 ${CARD_HOVER}`}
      >
        {/* Decorative background accents */}
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          {/* Header */}
          <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50"
                      aria-hidden="true"
                    />

                    <span
                      className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"
                      aria-hidden="true"
                    />
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                    Live platform activity
                  </span>
                </div>

                <h2
                  id="live-board-heading"
                  className="text-xl font-bold tracking-tight text-white sm:text-2xl"
                >
                  Queue activity right now
                </h2>

                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
                  See how busy participating organizations are before you
                  decide where to go.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Activity
                  className="h-4 w-4 text-amber-300"
                  aria-hidden="true"
                />

                <span className="text-xs font-medium text-white/70">
                  Live updates
                </span>
              </div>
            </div>
          </div>

          {/* Summary metric cards */}
          <div className="relative grid grid-cols-2 gap-3 border-b border-white/10 px-5 py-5 sm:gap-4 sm:px-8">
            <div
              className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 ${CARD_HOVER}`}
            >
              <div className="flex items-center gap-2 text-white/50">
                <Users
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                <span className="text-xs font-medium">
                  People waiting
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold tracking-tight text-amber-300 sm:text-4xl">
                {waitingNow.toLocaleString()}
              </p>

              <p className="mt-1 text-[11px] text-white/40">
                Across the platform
              </p>
            </div>

            <div
              className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 ${CARD_HOVER}`}
            >
              <div className="flex items-center gap-2 text-white/50">
                <CheckCircle2
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                <span className="text-xs font-medium">
                  Served today
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-300 sm:text-4xl">
                {servedToday.toLocaleString()}
              </p>

              <p className="mt-1 text-[11px] text-white/40">
                Completed service count
              </p>
            </div>
          </div>

          {/* Organization queue list */}
          <div className="relative px-5 sm:px-8">
            <div className="flex items-center justify-between gap-3 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                Organization queues
              </h3>

              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/50">
                {organizations.length}{" "}
                {organizations.length === 1
                  ? "organization"
                  : "organizations"}
              </span>
            </div>

            <ul className="mt-1">
              {organizations.map((org, index) => (
                <OrganizationRow
                  key={org.slug || org.name}
                  org={org}
                  index={index}
                />
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="relative mt-1 flex flex-col gap-2 border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-xs leading-relaxed text-white/45">
              {waitingNow > 0
                ? `${waitingNow.toLocaleString()} ${
                    waitingNow === 1 ? "person is" : "people are"
                  } currently waiting across the platform.`
                : "Nobody is waiting across the platform right now."}
            </p>

            <div className="flex shrink-0 items-center gap-2 text-[11px] text-white/40">
              <Clock3
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              <span>Refreshes every 15 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PlatformQueueStats;
