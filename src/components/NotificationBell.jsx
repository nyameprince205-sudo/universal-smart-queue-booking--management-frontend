import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { getNotificationsCenter } from "../api/activity";
const SEVERITY_STYLES = {
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  error: "bg-red-50 text-red-800 border-red-200",
  success: "bg-green-50 text-green-800 border-green-200",
  info: "bg-sky-50 text-sky-800 border-sky-200"
};
const REFRESH_INTERVAL_MS = 60000;
function NotificationBell() {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function load() {
      getNotificationsCenter().then(setData).catch(() => {});
    }
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const count = data?.count || 0;
  return <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="relative p-1.5 rounded-md hover:bg-slate-700/50 text-slate-300 transition-colors" aria-label="Notifications">
        <Bell className="w-4 h-4" />
        {count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>}
      </button>

      {open && <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-md shadow-lg border border-slate-200 py-2 z-20">
          <p className="px-3 pb-2 text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-100">
            Notifications
          </p>
          {count === 0 ? <p className="px-3 py-3 text-sm text-slate-400">Nothing to report right now.</p> : <ul className="max-h-72 overflow-y-auto">
              {data.notifications.map((n, i) => <li key={i} className="px-3 py-2">
                  <div className={`rounded-md border px-2 py-1.5 text-xs ${SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info}`}>
                    {n.message}
                  </div>
                </li>)}
            </ul>}
        </div>}
    </div>;
}
export default NotificationBell;