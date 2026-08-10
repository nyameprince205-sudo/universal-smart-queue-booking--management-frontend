import { useEffect, useState } from "react";
import {
  Ticket, CheckCircle2, UserX, Calendar, XCircle, CalendarCheck, UserPlus, Activity,
} from "lucide-react";
import { listRecentActivity } from "../api/activity";
import { formatRelativeTime } from "../utils/formatRelativeTime";

// Icon per action type — falls back to a generic icon for anything not in
// this list, matching the SAME "degrade gracefully, don't crash" reasoning
// as the backend's ACTION_MESSAGES lookup.
const ACTION_ICONS = {
  customer_joined_queue: Ticket,
  service_completed: CheckCircle2,
  customer_missed: UserX,
  booking_created: Calendar,
  booking_cancelled: XCircle,
  appointment_completed: CalendarCheck,
  staff_created: UserPlus,
};

function ActivityFeed() {
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listRecentActivity()
      .then(setActivity)
      .catch((err) => setError(err.response?.data?.error || "Couldn't load recent activity."));
  }, []);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-500 mb-4">Recent Activity</p>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && activity === null && <p className="text-sm text-slate-400">Loading…</p>}
      {activity?.length === 0 && <p className="text-sm text-slate-400">No recent activity yet.</p>}

      {activity && activity.length > 0 && (
        <ul className="space-y-3">
          {activity.map((entry) => {
            const Icon = ACTION_ICONS[entry.action] || Activity;
            return (
              <li key={entry.id} className="flex items-start gap-3">
                <div className="rounded-full bg-slate-100 p-1.5 mt-0.5 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">{entry.message}</p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(entry.createdAt)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ActivityFeed;
