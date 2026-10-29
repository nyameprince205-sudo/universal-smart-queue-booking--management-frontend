import { useEffect, useState, useCallback, useMemo } from "react";
import {
Package,
Rocket,
Crown,
Check,
AlertTriangle,
CreditCard,
CalendarDays,
Clock3,
ShieldCheck,
RefreshCw,
ArrowRight,
XCircle,
CheckCircle2,
History,
Sparkles,
} from "lucide-react";

import {
listPlans,
getMySubscription,
initializeSubscription,
verifyPayment,
listPaymentHistory,
} from "../../api/subscriptions";

const PENDING_REF_KEY = "queueSaasPendingPaymentRef";
const RENEWAL_REMINDER_DAYS = 7;

const STATUS_STYLES = {
active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
trial: "bg-sky-50 text-sky-700 ring-sky-200",
expired: "bg-red-50 text-red-700 ring-red-200",
cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

const PAYMENT_STATUS_STYLES = {
successful: "bg-emerald-50 text-emerald-700",
pending: "bg-amber-50 text-amber-700",
failed: "bg-red-50 text-red-700",
};

const PLAN_ICONS = [Package, Rocket, Crown];

const inputClass =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

function daysUntil(dateString) {
if (!dateString) return null;

const date = new Date(dateString);

if (Number.isNaN(date.getTime())) return null;

return Math.ceil(
(date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
);
}

function formatDate(dateString) {
if (!dateString) return "—";

const date = new Date(dateString);

if (Number.isNaN(date.getTime())) return "—";

return date.toLocaleDateString("en-GH", {
day: "numeric",
month: "short",
year: "numeric",
});
}

function formatMoney(amount, currency = "GHS") {
const value = Number(amount);

if (!Number.isFinite(value)) {
return `${currency} ${amount ?? "0"}`;
}

return `${currency} ${value.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLimit(value, label) {
return value != null
? `Up to ${value} ${label}`
: `Unlimited ${label}`;
}

function planActionLabel(plan, subscription, startingCheckoutPlanId) {
if (startingCheckoutPlanId === plan.id) {
return "Starting checkout...";
}

if (subscription?.plan === plan.name) {
return "Current Plan";
}

if (!subscription?.hasAccess || subscription?.isTrial) {
return "Subscribe";
}

const currentPrice = Number(subscription.price || 0);
const planPrice = Number(plan.price || 0);

if (planPrice > currentPrice) return "Upgrade";
if (planPrice < currentPrice) return "Switch Plan";

return "Switch Plan";
}

function formatFeature(feature) {
if (!feature?.key) return null;

const humanizedKey = feature.key
.split("_")
.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
.join(" ");

const value = String(feature.value ?? "").toLowerCase();

if (value === "false") return null;
if (value === "true") return humanizedKey;

return `${humanizedKey}: ${feature.value}`;
}

function SectionHeader({ icon: Icon, title, description, action }) {
return ( <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"> <div className="flex items-start gap-3"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"> <Icon size={20} /> </div>


    <div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  </div>

  {action}
</div>


);
}

function PaymentStatusBadge({ status }) {
return (
<span
className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        PAYMENT_STATUS_STYLES[status] || "bg-slate-100 text-slate-600"
      }`}
>
{status
? status.charAt(0).toUpperCase() + status.slice(1)
: "Unknown"} </span>
);
}

function SubscriptionPage() {
const [subscription, setSubscription] = useState(null);
const [plans, setPlans] = useState([]);
const [payments, setPayments] = useState([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [pendingReference, setPendingReference] = useState(() => {
try {
return sessionStorage.getItem(PENDING_REF_KEY);
} catch {
return null;
}
});

const [verifying, setVerifying] = useState(false);
const [verifyMessage, setVerifyMessage] = useState(null);
const [verificationError, setVerificationError] = useState(false);
const [startingCheckoutPlanId, setStartingCheckoutPlanId] = useState(null);
const [showCompare, setShowCompare] = useState(false);

const loadAll = useCallback(async (showLoader = true) => {
if (showLoader) setLoading(true);


setError("");

try {
  const [subData, plansData, paymentsData] = await Promise.all([
    getMySubscription(),
    listPlans(),
    listPaymentHistory(),
  ]);

  setSubscription(subData?.subscription === null ? null : subData);
  setPlans(Array.isArray(plansData) ? plansData : []);
  setPayments(Array.isArray(paymentsData) ? paymentsData : []);
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't load subscription information. Please try again."
  );
} finally {
  if (showLoader) setLoading(false);
}


}, []);

useEffect(() => {
loadAll();
}, [loadAll]);

const recommendedPlanId = useMemo(() => {
if (plans.length < 3) return null;


return plans[Math.floor(plans.length / 2)]?.id ?? null;


}, [plans]);

const renewalDaysLeft = subscription?.endDate
? daysUntil(subscription.endDate)
: null;

const showRenewalReminder =
subscription?.hasAccess &&
renewalDaysLeft !== null &&
renewalDaysLeft >= 0 &&
renewalDaysLeft <= RENEWAL_REMINDER_DAYS;

async function handleSubscribe(planId) {
setStartingCheckoutPlanId(planId);
setError("");
setVerifyMessage(null);
setVerificationError(false);


try {
  const { reference, authorizationUrl } =
    await initializeSubscription(planId);

  if (!reference || !authorizationUrl) {
    throw new Error("The payment provider returned an incomplete checkout response.");
  }

  try {
    sessionStorage.setItem(PENDING_REF_KEY, reference);
  } catch {
    // The current page can still continue without session storage.
  }

  setPendingReference(reference);

  const checkoutWindow = window.open(
    authorizationUrl,
    "_blank",
    "noopener,noreferrer"
  );

  if (!checkoutWindow) {
    setError(
      "Checkout was initialized, but the browser may have blocked the new tab. Allow pop-ups and try opening checkout again."
    );
  }
} catch (err) {
  setError(
    err.response?.data?.error ||
      err.message ||
      "Couldn't start checkout. Please try again."
  );
} finally {
  setStartingCheckoutPlanId(null);
}


}

async function handleVerify() {
if (!pendingReference || verifying) return;


setVerifying(true);
setVerifyMessage(null);
setVerificationError(false);
setError("");

try {
  const result = await verifyPayment(pendingReference);

  try {
    sessionStorage.removeItem(PENDING_REF_KEY);
  } catch {
    // Storage may be unavailable in some browser contexts.
  }

  setPendingReference(null);

  setVerifyMessage(
    result.alreadyProcessed
      ? "This payment was already confirmed earlier."
      : `Payment confirmed. Subscription status: ${
          result.subscription?.status || "updated"
        }.`
  );

  await loadAll(false);
} catch (err) {
  setVerificationError(true);
  setVerifyMessage(
    err.response?.data?.error ||
      "Payment couldn't be confirmed. If you completed checkout, wait a moment and try again."
  );
} finally {
  setVerifying(false);
}


}

function dismissPending() {
try {
sessionStorage.removeItem(PENDING_REF_KEY);
} catch {
// Ignore unavailable session storage.
}


setPendingReference(null);
setVerifyMessage(null);
setVerificationError(false);


}

if (loading) {
return ( <div className="min-h-full bg-slate-50 px-4 py-8 sm:px-8"> <div className="mx-auto max-w-7xl animate-pulse space-y-6"> <div className="h-8 w-56 rounded-lg bg-slate-200" /> <div className="h-4 w-80 max-w-full rounded bg-slate-200" />


      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="mt-5 h-12 w-52 rounded bg-slate-100" />
        <div className="mt-5 h-20 rounded bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-72 rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </div>
  </div>
);


}

return ( <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"> <div className="mx-auto max-w-7xl">
{/* Page header */} <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"> <div> <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"> <Sparkles size={14} />
Plans & Billing </div>


        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Subscription
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Manage your plan, monitor access, and review your organization's
          payment history.
        </p>
      </div>

      <button
        type="button"
        onClick={() => loadAll()}
        disabled={loading}
        className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 sm:self-auto"
      >
        <RefreshCw size={15} />
        Refresh
      </button>
    </div>

    {error && (
      <div
        role="alert"
        className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        <AlertTriangle className="mt-0.5 shrink-0" size={18} />
        <div className="flex-1">
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 leading-5">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => setError("")}
          className="rounded-lg px-2 py-1 font-semibold hover:bg-red-100"
          aria-label="Dismiss error"
        >
          <XCircle size={17} />
        </button>
      </div>
    )}

    {/* Renewal reminder */}
    {showRenewalReminder && (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle
          className="mt-0.5 shrink-0 text-amber-600"
          size={19}
        />
        <div>
          <p className="text-sm font-semibold text-amber-900">
            {renewalDaysLeft === 0
              ? "Your subscription expires today."
              : `Your subscription expires in ${renewalDaysLeft} day${
                  renewalDaysLeft === 1 ? "" : "s"
                }.`}
          </p>
          <p className="mt-1 text-sm leading-5 text-amber-800">
            Review your plan and make arrangements to maintain uninterrupted
            access.
          </p>
        </div>
      </div>
    )}

    {/* Current subscription */}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
        <SectionHeader
          icon={CreditCard}
          title="Current Subscription"
          description="Your organization's current access and billing information."
        />
      </div>

      <div className="p-5 sm:p-7">
        {subscription?.plan ? (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {subscription.isTrial
                    ? "Trial Access"
                    : "Current Plan"}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {subscription.plan}
                  </h2>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                      STATUS_STYLES[
                        subscription.hasAccess
                          ? subscription.status
                          : "expired"
                      ] || STATUS_STYLES.cancelled
                    }`}
                  >
                    {subscription.hasAccess
                      ? subscription.status || "Active"
                      : "Expired"}
                  </span>
                </div>
              </div>

              {subscription.hasAccess && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">
                    Plan price
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatMoney(subscription.price)}
                  </p>
                </div>
              )}
            </div>

            {subscription.hasAccess ? (
              <>
                <div className="mt-7 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5 sm:p-6">
                  <p className="text-sm font-medium text-indigo-700">
                    {subscription.isTrial
                      ? "Time left in your access period"
                      : "Time remaining"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span
                      className={`text-4xl font-bold tracking-tight sm:text-5xl ${
                        subscription.daysRemaining <= 3
                          ? "text-red-600"
                          : subscription.daysRemaining <= 7
                            ? "text-amber-600"
                            : "text-slate-900"
                      }`}
                    >
                      {subscription.daysRemaining ?? "—"}
                    </span>

                    <span className="text-sm text-slate-500">
                      {subscription.daysRemaining === 1
                        ? "day remaining"
                        : "days remaining"}
                    </span>
                  </div>

                  {Number.isFinite(Number(subscription.daysRemaining)) &&
                    Number(subscription.daysRemaining) >= 0 && (
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-indigo-100">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                (Number(subscription.daysRemaining) / 30) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarDays size={16} />
                      <p className="text-xs font-medium">Started</p>
                    </div>
                    <p className="mt-2 font-semibold text-slate-800">
                      {formatDate(subscription.startDate)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock3 size={16} />
                      <p className="text-xs font-medium">
                        {subscription.isTrial
                          ? "Access ends"
                          : "Billing / End Date"}
                      </p>
                    </div>
                    <p className="mt-2 font-semibold text-slate-800">
                      {formatDate(subscription.endDate)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <RefreshCw size={16} />
                      <p className="text-xs font-medium">Renewal</p>
                    </div>
                    <p className="mt-2 font-semibold text-slate-800">
                      {subscription.autoRenew
                        ? "Automatic"
                        : "Manual"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="mt-0.5 shrink-0 text-red-600"
                    size={20}
                  />
                  <div>
                    <p className="font-semibold text-red-900">
                      {subscription.isTrial
                        ? "Your trial access has expired."
                        : "Your subscription has expired."}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-red-800">
                      Your previous access ended on{" "}
                      {formatDate(subscription.endDate)}. Choose a plan
                      below to restore access. Your existing organization
                      data is not deleted by this page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Choose a plan to get started
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Select the subscription that fits your organization's needs
              and unlock the features available on that plan.
            </p>
          </div>
        )}
      </div>
    </section>

    {/* Payment verification feedback */}
    {verifyMessage && (
      <div
        role={verificationError ? "alert" : "status"}
        className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
          verificationError
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}
      >
        {verificationError ? (
          <AlertTriangle size={19} className="mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
        )}
        <p className="flex-1 leading-6">{verifyMessage}</p>

        <button
          type="button"
          onClick={() => setVerifyMessage(null)}
          aria-label="Dismiss payment message"
          className="rounded-lg p-1 hover:bg-black/5"
        >
          <XCircle size={16} />
        </button>
      </div>
    )}

    {/* Pending payment */}
    {pendingReference && (
      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <CreditCard size={20} />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-amber-950">
              Payment awaiting confirmation
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              If you completed checkout in the payment tab, return here and
              verify the transaction. If you have not completed payment,
              finish checkout first.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifying && (
                  <RefreshCw size={15} className="animate-spin" />
                )}
                {verifying
                  ? "Verifying payment..."
                  : "I've completed payment — Verify"}
              </button>

              <button
                type="button"
                onClick={dismissPending}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </section>
    )}

    {/* Plans */}
    <section className="mt-9">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Available Plans
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Compare features and choose the plan that works for your
            organization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCompare((current) => !current)}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:self-auto"
        >
          {showCompare ? "Hide comparison" : "Compare plans"}
          <ArrowRight
            size={15}
            className={`transition-transform ${
              showCompare ? "rotate-90" : ""
            }`}
          />
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Package className="mx-auto text-slate-400" size={32} />
          <h3 className="mt-3 font-bold text-slate-900">
            No plans available
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            There are no subscription plans to display right now. Please
            try again later.
          </p>
        </div>
      ) : (
        <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = PLAN_ICONS[index % PLAN_ICONS.length];
            const isCurrentPlan = subscription?.plan === plan.name;
            const isRecommended = plan.id === recommendedPlanId;
            const isStarting = startingCheckoutPlanId === plan.id;

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${
                  isCurrentPlan
                    ? "border-indigo-400 ring-2 ring-indigo-100"
                    : isRecommended
                      ? "border-indigo-200"
                      : "border-slate-200"
                }`}
              >
                {isRecommended && !isCurrentPlan && (
                  <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    <Sparkles size={12} />
                    Recommended
                  </span>
                )}

                {isCurrentPlan && (
                  <span className="absolute -top-3 left-5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Current Plan
                  </span>
                )}

                <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {plan.name}
                </h3>

                <div className="mt-3 flex flex-wrap items-baseline gap-1.5">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatMoney(plan.price)}
                  </span>
                  <span className="text-sm text-slate-500">
                    / {plan.billingCycle || "billing period"}
                  </span>
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                  <div className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <span>{formatLimit(plan.maxBranches, "branches")}</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <span>{formatLimit(plan.maxUsers, "users")}</span>
                  </div>

                  {(Array.isArray(plan.features) ? plan.features : [])
                    .map((feature) => ({
                      raw: feature,
                      label: formatFeature(feature),
                    }))
                    .filter((feature) => feature.label !== null)
                    .map(({ raw, label }) => (
                      <div
                        key={raw.key}
                        className="flex items-start gap-2.5 text-sm text-slate-600"
                      >
                        <Check
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />
                        <span>{label}</span>
                      </div>
                    ))}
                </div>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={
                      isCurrentPlan ||
                      startingCheckoutPlanId !== null ||
                      Boolean(pendingReference)
                    }
                    className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isCurrentPlan
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500/20"
                    }`}
                  >
                    {isStarting && (
                      <RefreshCw size={15} className="animate-spin" />
                    )}
                    {planActionLabel(
                      plan,
                      subscription,
                      startingCheckoutPlanId
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Plan comparison */}
      {showCompare && plans.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-bold text-slate-900">Plan comparison</h3>
            <p className="mt-1 text-sm text-slate-500">
              Compare the prices and limits for each available plan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Feature</th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="px-5 py-4 font-semibold"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-5 py-4 text-slate-600">Price</td>
                  {plans.map((plan) => (
                    <td
                      key={plan.id}
                      className="px-5 py-4 font-semibold text-slate-900"
                    >
                      {formatMoney(plan.price)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-5 py-4 text-slate-600">Billing cycle</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-5 py-4 text-slate-700">
                      {plan.billingCycle || "—"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-5 py-4 text-slate-600">Branches</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-5 py-4 text-slate-700">
                      {plan.maxBranches ?? "Unlimited"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-5 py-4 text-slate-600">Users</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-5 py-4 text-slate-700">
                      {plan.maxUsers ?? "Unlimited"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>

    {/* Payment history */}
    <section className="mt-9 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <SectionHeader
          icon={History}
          title="Payment History"
          description="Review transactions associated with your organization."
        />
      </div>

      {payments.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <CreditCard size={23} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">
            No payments yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Your payment transactions will appear here after they are
            recorded.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile payment cards */}
          <div className="divide-y divide-slate-100 sm:hidden">
            {payments.map((payment) => (
              <div key={payment.id} className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      {formatMoney(payment.amount, payment.currency || "GHS")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>

                  <PaymentStatusBadge status={payment.status} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Payment reference
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-600">
                    {payment.gatewayReference || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop payment table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {formatDate(payment.createdAt)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                      {formatMoney(
                        payment.amount,
                        payment.currency || "GHS"
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={payment.status} />
                    </td>

                    <td className="max-w-xs break-all px-6 py-4 font-mono text-xs text-slate-500">
                      {payment.gatewayReference || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>

    {/* Security reassurance */}
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={20} />
      <div>
        <p className="text-sm font-semibold text-slate-800">
          Payment verification
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Subscription access should be granted only after your backend
          verifies the payment with the payment provider. This page displays
          the result returned by your existing verification API.
        </p>
      </div>
    </div>
  </div>
</div>


);
}

export default SubscriptionPage;
