import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMySubscription } from "../api/subscriptions";
const STYLES = {
  soon: {
    wrap: "bg-sky-50 border-sky-200 text-sky-900",
    button: "bg-sky-600 hover:bg-sky-700 text-white"
  },
  urgent: {
    wrap: "bg-amber-50 border-amber-300 text-amber-900",
    button: "bg-amber-600 hover:bg-amber-700 text-white"
  },
  critical: {
    wrap: "bg-red-50 border-red-300 text-red-900",
    button: "bg-red-600 hover:bg-red-700 text-white"
  },
  expired: {
    wrap: "bg-red-50 border-red-300 text-red-900",
    button: "bg-red-600 hover:bg-red-700 text-white"
  }
};
function message(sub) {
  const what = sub.isTrial ? "Your 30-day access period" : "Your subscription";
  if (!sub.hasAccess) {
    return {
      title: `${what} has expired.`,
      detail: "Subscribe to a plan to continue taking bookings and serving customers."
    };
  }
  if (sub.daysRemaining <= 1) {
    return {
      title: sub.daysRemaining === 0 ? `${what} expires today.` : `${what} expires tomorrow.`,
      detail: "Subscribe now to avoid any interruption."
    };
  }
  return {
    title: `${what} expires in ${sub.daysRemaining} days.`,
    detail: "Choose a plan to continue uninterrupted access."
  };
}
function SubscriptionBanner() {
  const [sub, setSub] = useState(null);
  useEffect(() => {
    getMySubscription().then(setSub).catch(() => {});
  }, []);
  if (!sub) return null;
  if (sub.hasAccess && !sub.warningLevel) return null;
  const level = sub.hasAccess ? sub.warningLevel : "expired";
  const style = STYLES[level] || STYLES.soon;
  const {
    title,
    detail
  } = message(sub);
  return <div className={`border-b px-4 sm:px-8 py-3 ${style.wrap}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm opacity-90">{detail}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/admin/subscription" className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${style.button}`}>
            {sub.hasAccess ? "Choose a Plan" : "Subscribe Now"}
          </Link>
          {!sub.hasAccess && <Link to="/admin/subscription" className="text-sm underline whitespace-nowrap">
              View Billing
            </Link>}
        </div>
      </div>
    </div>;
}
export default SubscriptionBanner;