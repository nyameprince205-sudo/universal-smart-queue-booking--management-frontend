import { useEffect, useState, useRef } from "react";
import {
Bell,
CheckCircle2,
AlertTriangle,
AlertCircle,
Info,
X,
Clock,
BellRing,
} from "lucide-react";
import { getNotificationsCenter } from "../api/activity";

const REFRESH_INTERVAL_MS = 60000;

const SEVERITY_STYLES = {
warning: {
container: "border-amber-200 bg-amber-50",
icon: "text-amber-600",
text: "text-amber-900",
label: "Warning",
Icon: AlertTriangle,
},
error: {
container: "border-red-200 bg-red-50",
icon: "text-red-600",
text: "text-red-900",
label: "Error",
Icon: AlertCircle,
},
success: {
container: "border-emerald-200 bg-emerald-50",
icon: "text-emerald-600",
text: "text-emerald-900",
label: "Success",
Icon: CheckCircle2,
},
info: {
container: "border-sky-200 bg-sky-50",
icon: "text-sky-600",
text: "text-sky-900",
label: "Information",
Icon: Info,
},
};

function NotificationBell() {
const [data, setData] = useState(null);
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

const ref = useRef(null);
const buttonRef = useRef(null);
const panelRef = useRef(null);

useEffect(() => {
let active = true;


async function loadNotifications(isInitial = false) {
  if (isInitial) {
    setLoading(true);
  } else {
    setRefreshing(true);
  }

  try {
    const result = await getNotificationsCenter();

    if (active) {
      setData(result);
    }
  } catch {
    // Preserve existing notification data if a refresh fails.
  } finally {
    if (active) {
      setLoading(false);
      setRefreshing(false);
    }
  }
}

loadNotifications(true);

const intervalId = setInterval(() => {
  loadNotifications(false);
}, REFRESH_INTERVAL_MS);

return () => {
  active = false;
  clearInterval(intervalId);
};


}, []);

useEffect(() => {
function handleOutsideInteraction(event) {
if (ref.current && !ref.current.contains(event.target)) {
setOpen(false);
}
}


function handleKeyDown(event) {
  if (event.key === "Escape") {
    setOpen(false);
    buttonRef.current?.focus();
  }
}

document.addEventListener("mousedown", handleOutsideInteraction);
document.addEventListener("touchstart", handleOutsideInteraction);
document.addEventListener("keydown", handleKeyDown);

return () => {
  document.removeEventListener("mousedown", handleOutsideInteraction);
  document.removeEventListener("touchstart", handleOutsideInteraction);
  document.removeEventListener("keydown", handleKeyDown);
};


}, []);

useEffect(() => {
if (open) {
panelRef.current?.focus();
}
}, [open]);

const notifications = Array.isArray(data?.notifications)
? data.notifications
: [];

const count = Number(data?.count) || 0;
const displayCount = count > 9 ? "9+" : count;

return ( <div className="relative" ref={ref}>
{/* Notification trigger */}
<button
ref={buttonRef}
type="button"
onClick={() => setOpen((previous) => !previous)}
aria-label={`Notifications${count > 0 ? `, ${count} available` : ""}`}
aria-expanded={open}
aria-haspopup="dialog"
className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
          open
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-transparent text-stone-500 hover:border-stone-200 hover:bg-stone-100 hover:text-stone-900"
        }`}
>
{count > 0 ? ( <BellRing className="h-5 w-5" aria-hidden="true" />
) : ( <Bell className="h-5 w-5" aria-hidden="true" />
)}


    {count > 0 && (
      <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
        {displayCount}
      </span>
    )}
  </button>

  {/* Notification dropdown */}
  {open && (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      tabIndex={-1}
      className="fixed left-3 right-3 top-16 z-50 flex max-h-[min(75vh,520px)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/10 focus:outline-none sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-stone-100 bg-white px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-stone-900">
              Notifications
            </h2>

            <p className="mt-0.5 text-xs text-stone-500">
              Stay updated on your workspace
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close notifications"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Notification count */}
      <div className="flex shrink-0 items-center justify-between border-b border-stone-100 bg-stone-50/70 px-4 py-3 sm:px-5">
        <span className="text-xs font-medium text-stone-600">
          Recent activity
        </span>

        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
          {count} {count === 1 ? "notification" : "notifications"}
        </span>
      </div>

      {/* Notification list */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="space-y-3 p-4 sm:p-5" aria-label="Loading notifications">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border border-stone-100 p-3"
              >
                <div className="flex gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-stone-100" />

                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-20 rounded bg-stone-100" />
                    <div className="h-3 w-full rounded bg-stone-100" />
                    <div className="h-3 w-2/3 rounded bg-stone-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2
                className="h-7 w-7"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-4 text-sm font-bold text-stone-900">
              You're all caught up
            </h3>

            <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-stone-500">
              There's nothing to report right now. New notifications will
              appear here when they're available.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {notifications.map((notification, index) => {
              const style =
                SEVERITY_STYLES[notification.severity] ||
                SEVERITY_STYLES.info;

              const SeverityIcon = style.Icon;

              return (
                <li
                  key={notification.id ?? `${notification.message}-${index}`}
                  className="px-4 py-3 transition-colors hover:bg-stone-50/80 sm:px-5"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${style.container}`}
                    >
                      <SeverityIcon
                        className={`h-4 w-4 ${style.icon}`}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${style.icon}`}
                        >
                          {style.label}
                        </span>
                      </div>

                      <p className="break-words text-sm leading-relaxed text-stone-700">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-stone-100 bg-white px-4 py-3 sm:px-5">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Refreshes every minute</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              refreshing ? "animate-pulse bg-amber-500" : "bg-emerald-500"
            }`}
            aria-hidden="true"
          />

          <span className="text-[11px] font-medium text-stone-500">
            {refreshing ? "Updating..." : "Auto-refresh on"}
          </span>
        </div>
      </div>
    </div>
  )}
</div>


);
}

export default NotificationBell;
