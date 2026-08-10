import { useEffect, useState, useCallback } from "react";
import { Package, Rocket, Crown, Check, AlertTriangle } from "lucide-react";
import { listPlans, getMySubscription, initializeSubscription, verifyPayment, listPaymentHistory } from "../../api/subscriptions";

const PENDING_REF_KEY = "queueSaasPendingPaymentRef";
const RENEWAL_REMINDER_DAYS = 7;

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  trial: "bg-sky-100 text-sky-700",
};

const PAYMENT_STATUS_STYLES = {
  successful: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

// Position-based icons — plan NAMES aren't known ahead of time (could be
// "Free"/"Starter"/"Pro", or anything else an admin configures), so this
// keys off tier ORDER (plans already come back sorted by price ascending)
// rather than trying to match specific plan names.
const PLAN_ICONS = [Package, Rocket, Crown];

function daysUntil(dateString) {
  return Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// null means unlimited (a real, intentional value your database stores for
// the Enterprise tier) — printing it directly leaves "Up to  branches" with
// a blank gap where React silently renders nothing for null/undefined.
function formatLimit(value, label) {
  return value != null ? `Up to ${value} ${label}` : `Unlimited ${label}`;
}

// Plan feature VALUES are always strings (schema: featureValue is a
// VARCHAR, even for booleans) — "true"/"false" as literal text, not real
// booleans. A feature that's OFF isn't a selling point, so it's dropped
// entirely rather than shown as a strikethrough or "false" — nobody reads
// a pricing card looking for what ISN'T included. snake_case keys get
// humanized into Title Case; non-boolean values keep their own text
// (e.g. "basic"/"advanced" for a "reports" tier) rather than being
// force-fit into a yes/no shape they don't have.
function formatFeature(feature) {
  const humanizedKey = feature.key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const value = feature.value.toLowerCase();
  if (value === "false") return null;
  if (value === "true") return humanizedKey;
  return `${humanizedKey}: ${feature.value}`;
}

function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingReference, setPendingReference] = useState(() => sessionStorage.getItem(PENDING_REF_KEY));
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(null);
  const [startingCheckoutPlanId, setStartingCheckoutPlanId] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subData, plansData, paymentsData] = await Promise.all([getMySubscription(), listPlans(), listPaymentHistory()]);
      setSubscription(subData.subscription === null ? null : subData);
      setPlans(plansData);
      setPayments(paymentsData);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load subscription info.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleSubscribe(planId) {
    setStartingCheckoutPlanId(planId);
    setError(null);
    setVerifyMessage(null);
    try {
      const { reference, authorizationUrl } = await initializeSubscription(planId);
      sessionStorage.setItem(PENDING_REF_KEY, reference);
      setPendingReference(reference);
      window.open(authorizationUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't start checkout. Please try again.");
    } finally {
      setStartingCheckoutPlanId(null);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    setVerifyMessage(null);
    try {
      const result = await verifyPayment(pendingReference);
      sessionStorage.removeItem(PENDING_REF_KEY);
      setPendingReference(null);
      setVerifyMessage(
        result.alreadyProcessed
          ? "This payment was already confirmed earlier."
          : `Payment confirmed — subscription is now ${result.subscription?.status}.`
      );
      await loadAll();
    } catch (err) {
      setVerifyMessage(err.response?.data?.error || "Payment couldn't be confirmed. If you completed checkout, wait a moment and try again.");
    } finally {
      setVerifying(false);
    }
  }

  function dismissPending() {
    sessionStorage.removeItem(PENDING_REF_KEY);
    setPendingReference(null);
    setVerifyMessage(null);
  }

  // Recommended = the middle tier, a common SaaS convention — not the
  // cheapest (too basic to highlight) or the most expensive (looks like
  // upselling). With fewer than 3 plans there's no meaningful "middle", so
  // nothing gets the badge rather than picking one arbitrarily.
  const recommendedPlanId = plans.length >= 3 ? plans[Math.floor(plans.length / 2)].id : null;
  const renewalDaysLeft = subscription?.endDate ? daysUntil(subscription.endDate) : null;
  const showRenewalReminder = renewalDaysLeft != null && renewalDaysLeft >= 0 && renewalDaysLeft <= RENEWAL_REMINDER_DAYS;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-800">Subscription</h1>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading && <p className="mt-8 text-slate-400">Loading…</p>}

      {!loading && (
        <>
          {showRenewalReminder && (
            <div className="mt-6 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                Your subscription {renewalDaysLeft === 0 ? "expires today" : `renews in ${renewalDaysLeft} day${renewalDaysLeft === 1 ? "" : "s"}`}.
              </p>
            </div>
          )}

          {/* Current Plan / Status / Next Billing Date */}
          <div className="mt-6 bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500">Current Plan</p>
            {subscription ? (
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <p className="text-xl font-semibold text-slate-800">{subscription.plan}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[subscription.status] || "bg-slate-100 text-slate-500"}`}>
                    {subscription.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs">Next Billing Date</p>
                    <p className="text-slate-700 font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Renewal</p>
                    <p className="text-slate-700 font-medium">{subscription.autoRenew ? "Automatic" : "Manual"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-slate-500">No active subscription — choose a plan below to get started.</p>
            )}
          </div>

          {verifyMessage && (
            <div className="mt-6 rounded-md bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-700">
              {verifyMessage}
            </div>
          )}

          {pendingReference && (
            <div className="mt-6 rounded-md bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm text-amber-800">
                Checkout opened in a new tab. Complete the payment there, then come back and verify it here —
                Paystack can't confirm this automatically on a local dev server.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="rounded-md bg-slate-800 text-white px-3 py-1.5 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {verifying ? "Verifying…" : "I've completed payment — Verify now"}
                </button>
                <button onClick={dismissPending} className="text-sm text-slate-500 hover:underline">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Available plans — modern cards */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">Available Plans</p>
              <button onClick={() => setShowCompare((s) => !s)} className="text-sm text-sky-600 hover:underline">
                {showCompare ? "Hide comparison" : "Compare Plans"}
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {plans.map((plan, index) => {
                const Icon = PLAN_ICONS[index % PLAN_ICONS.length];
                const isCurrentPlan = subscription?.plan === plan.name;
                const isRecommended = plan.id === recommendedPlanId;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg border p-5 ${
                      isRecommended ? "border-sky-400 shadow-md" : "border-slate-200"
                    } ${isCurrentPlan ? "bg-sky-50" : "bg-white"}`}
                  >
                    {isRecommended && !isCurrentPlan && (
                      <span className="absolute -top-2.5 left-4 rounded-full bg-sky-600 text-white text-xs font-medium px-2 py-0.5">
                        Recommended
                      </span>
                    )}
                    {isCurrentPlan && (
                      <span className="absolute -top-2.5 left-4 rounded-full bg-green-600 text-white text-xs font-medium px-2 py-0.5">
                        Current Plan
                      </span>
                    )}

                    <Icon className="w-6 h-6 text-sky-600" />
                    <p className="mt-2 font-semibold text-slate-800">{plan.name}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-800">
                      GHS {plan.price}
                      <span className="text-sm font-normal text-slate-400"> / {plan.billingCycle}</span>
                    </p>
                    <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600 shrink-0" /> {formatLimit(plan.maxBranches, "branches")}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600 shrink-0" /> {formatLimit(plan.maxUsers, "users")}
                      </li>
                      {plan.features
                        .map((f) => ({ raw: f, label: formatFeature(f) }))
                        .filter((f) => f.label !== null)
                        .map((f) => (
                          <li key={f.raw.key} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-green-600 shrink-0" /> {f.label}
                          </li>
                        ))}
                    </ul>
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrentPlan || startingCheckoutPlanId === plan.id}
                      className="mt-4 w-full rounded-md bg-sky-600 text-white py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : startingCheckoutPlanId === plan.id
                        ? "Starting checkout…"
                        : subscription
                        ? "Upgrade"
                        : "Subscribe"}
                    </button>
                  </div>
                );
              })}
            </div>

            {showCompare && plans.length > 0 && (
              <div className="mt-4 bg-white rounded-lg border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Feature</th>
                      {plans.map((p) => (
                        <th key={p.id} className="px-4 py-2 font-medium">{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-2 text-slate-600">Price</td>
                      {plans.map((p) => <td key={p.id} className="px-4 py-2 font-medium text-slate-800">GHS {p.price}</td>)}
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-slate-600">Branches</td>
                      {plans.map((p) => <td key={p.id} className="px-4 py-2 text-slate-700">{p.maxBranches != null ? p.maxBranches : "Unlimited"}</td>)}
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-slate-600">Users</td>
                      {plans.map((p) => <td key={p.id} className="px-4 py-2 text-slate-700">{p.maxUsers != null ? p.maxUsers : "Unlimited"}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="mt-8 bg-white rounded-lg border border-slate-200 overflow-hidden">
            <p className="text-sm font-medium text-slate-500 px-5 pt-5 pb-3">Payment History</p>
            {payments.length === 0 ? (
              <p className="text-sm text-slate-400 px-5 pb-5">No payments yet.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-2 font-medium">Date</th>
                    <th className="px-5 py-2 font-medium">Amount</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                    <th className="px-5 py-2 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-5 py-2 text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-2 font-medium text-slate-800">{p.currency} {p.amount}</td>
                      <td className="px-5 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLES[p.status] || "bg-slate-100 text-slate-500"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-slate-400 text-xs">{p.gatewayReference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SubscriptionPage;
