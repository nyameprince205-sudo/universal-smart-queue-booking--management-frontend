import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
AlertTriangle,
Clock3,
CreditCard,
ShieldCheck,
ArrowRight,
X,
CheckCircle2,
} from "lucide-react";
import { getMySubscription } from "../api/subscriptions";

const STYLES = {
soon: {
wrap: "border-sky-200 bg-sky-50",
iconWrap: "bg-sky-100 text-sky-700",
title: "text-sky-950",
detail: "text-sky-800",
button:
"bg-sky-700 text-white hover:bg-sky-800 focus-visible:ring-sky-500",
icon: Clock3,
label: "Renewal approaching",
},
urgent: {
wrap: "border-amber-200 bg-amber-50",
iconWrap: "bg-amber-100 text-amber-800",
title: "text-amber-950",
detail: "text-amber-900",
button:
"bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500",
icon: AlertTriangle,
label: "Action recommended",
},
critical: {
wrap: "border-orange-200 bg-orange-50",
iconWrap: "bg-orange-100 text-orange-700",
title: "text-orange-950",
detail: "text-orange-900",
button:
"bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-500",
icon: AlertTriangle,
label: "Renewal required",
},
expired: {
wrap: "border-red-200 bg-red-50",
iconWrap: "bg-red-100 text-red-700",
title: "text-red-950",
detail: "text-red-800",
button:
"bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
icon: ShieldCheck,
label: "Access expired",
},
};

function getSubscriptionMessage(sub) {
const what = sub.isTrial
? "Your 30-day trial"
: "Your subscription";

if (!sub.hasAccess) {
return {
title: `${what} has expired.`,
detail:
"Choose a plan to restore access and continue managing your bookings and queues.",
};
}

if (sub.daysRemaining <= 1) {
return {
title:
sub.daysRemaining === 0
? `${what} expires today.`
: `${what} expires tomorrow.`,
detail:
"Renew now to help avoid interruption to your business operations.",
};
}

return {
title: `${what} expires in ${sub.daysRemaining} days.`,
detail:
"Review your subscription and choose a plan to maintain uninterrupted access.",
};
}

function SubscriptionBanner() {
const [sub, setSub] = useState(null);
const [dismissed, setDismissed] = useState(false);

useEffect(() => {
let active = true;


getMySubscription()
  .then((data) => {
    if (active) setSub(data);
  })
  .catch(() => {
    // Keep the banner hidden if subscription information cannot be loaded.
  });

return () => {
  active = false;
};


}, []);

if (!sub) return null;
if (sub.hasAccess && !sub.warningLevel) return null;
if (dismissed) return null;

const level = sub.hasAccess ? sub.warningLevel : "expired";
const style = STYLES[level] || STYLES.soon;
const Icon = style.icon;
const { title, detail } = getSubscriptionMessage(sub);

return (
<section
role="status"
aria-label="Subscription notice"
className={`border-b px-4 py-4 sm:px-6 lg:px-8 ${style.wrap}`}
> <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div className="flex min-w-0 items-start gap-3">
<div
className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
> <Icon className="h-5 w-5" aria-hidden="true" /> </div>


      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.14em] ${style.detail}`}
          >
            {style.label}
          </span>

          {sub.isTrial && (
            <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-semibold">
              TRIAL
            </span>
          )}
        </div>

        <h2 className={`text-sm font-bold sm:text-base ${style.title}`}>
          {title}
        </h2>

        <p className={`mt-1 text-sm leading-6 ${style.detail}`}>
          {detail}
        </p>
      </div>
    </div>

    <div className="flex shrink-0 flex-wrap items-center gap-3 pl-0 sm:pl-2">
      <Link
        to="/admin/subscription"
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${style.button}`}
      >
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        {sub.hasAccess ? "Manage Subscription" : "Subscribe Now"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>

      {!sub.hasAccess && (
        <Link
          to="/admin/subscription"
          className={`inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4 ${style.title}`}
        >
          View billing
        </Link>
      )}

      {sub.hasAccess && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss subscription reminder"
          title="Dismiss reminder"
          className={`rounded-lg p-2 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  </div>
</section>


);
}

export default SubscriptionBanner;
