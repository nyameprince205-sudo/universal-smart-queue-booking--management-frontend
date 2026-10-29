import { useEffect, useState } from "react";
import {
  Ticket,
  CheckCircle2,
  UserX,
  Calendar,
  XCircle,
  CalendarCheck,
  UserPlus,
  Activity,
  Clock3,
  RefreshCw,
  History,
  CircleAlert,
  Sparkles,
} from "lucide-react";

import { listRecentActivity } from "../api/activity";
import { formatRelativeTime } from "../utils/formatRelativeTime";

const ACTION_CONFIG = {
  customer_joined_queue: {
    icon: Ticket,
    color: "bg-emerald-50 text-emerald-800",
    label: "Queue",
  },
  service_completed: {
    icon: CheckCircle2,
    color: "bg-green-50 text-green-700",
    label: "Completed",
  },
  customer_missed: {
    icon: UserX,
    color: "bg-red-50 text-red-700",
    label: "Missed",
  },
  booking_created: {
    icon: Calendar,
    color: "bg-blue-50 text-blue-700",
    label: "Booking",
  },
  booking_cancelled: {
    icon: XCircle,
    color: "bg-rose-50 text-rose-700",
    label: "Cancelled",
  },
  appointment_completed: {
    icon: CalendarCheck,
    color: "bg-teal-50 text-teal-700",
    label: "Appointment",
  },
  staff_created: {
    icon: UserPlus,
    color: "bg-amber-50 text-amber-800",
    label: "Staff",
  },
};

function ActivitySkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading recent activity">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex animate-pulse items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-stone-100" />

          <div className="min-w-0 flex-1 pt-1">
            <div className="h-3.5 w-4/5 rounded bg-stone-100" />
            <div className="mt-2 h-3 w-2/5 rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityFeed() {
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadActivity() {
    setError(null);
    setRefreshing(true);

    try {
      const result = await listRecentActivity();
      setActivity(result);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't load recent activity. Please try again."
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function fetchActivity() {
      try {
        const result = await listRecentActivity();

        if (active) {
          setActivity(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.error ||
              "Couldn't load recent activity. Please try again."
          );
        }
      }
    }

    fetchActivity();

    return () => {
      active = false;
    };
  }, []);

  const hasActivity = Array.isArray(activity) && activity.length > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950">
            <History className="h-5 w-5 text-amber-300" />
          </div>

          <div>
            <h2 className="font-semibold tracking-tight text-stone-900">
              Recent activity
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              The latest events from your workspace
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadActivity}
          disabled={refreshing}
          aria-label="Refresh recent activity"
          title="Refresh activity"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Activity content */}
      <div className="p-5 sm:p-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-900">
                Unable to load activity
              </p>
              <p className="mt-1 text-sm leading-5 text-red-700">{error}</p>

              <button
                type="button"
                onClick={loadActivity}
                disabled={refreshing}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-800 underline underline-offset-4 hover:text-red-950 disabled:opacity-50"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!error && activity === null && <ActivitySkeleton />}

        {!error && activity?.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
              <Activity className="h-7 w-7 text-stone-400" />
            </div>

            <h3 className="mt-4 font-semibold text-stone-800">
              No activity yet
            </h3>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-stone-500">
              When customers join queues, create bookings, or complete
              appointments, their activity will appear here.
            </p>
          </div>
        )}

        {hasActivity && (
          <ul className="divide-y divide-stone-100">
            {activity.map((entry, index) => {
              const config = ACTION_CONFIG[entry.action] || {
                icon: Activity,
                color: "bg-stone-100 text-stone-600",
                label: "Activity",
              };

              const Icon = config.icon;

              return (
                <li
                  key={entry.id}
                  className={`group flex items-start gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4 ${
                    index === 0 ? "" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${config.color}`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-stone-800">
                        {config.label}
                      </span>

                      {index === 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          <Sparkles className="h-3 w-3" />
                          Latest
                        </span>
                      )}
                    </div>

                    <p className="mt-1 break-words text-sm leading-6 text-stone-600">
                      {entry.message}
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
                      <Clock3 className="h-3.5 w-3.5 shrink-0" />
                      {formatRelativeTime(entry.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {hasActivity && !error && (
        <div className="border-t border-stone-100 bg-stone-50/70 px-5 py-3.5 sm:px-6">
          <p className="text-center text-xs text-stone-500">
            Showing {activity.length} recent{" "}
            {activity.length === 1 ? "event" : "events"}
          </p>
        </div>
      )}
    </section>
  );
}

export default ActivityFeed;




