import { useEffect, useState, useCallback } from "react";
import { listPlans, getMySubscription, initializeSubscription, verifyPayment } from "../../api/subscriptions";
const PENDING_REF_KEY = "queueSaasPendingPaymentRef";
const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  trial: "bg-sky-100 text-sky-700",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500"
};
function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingReference, setPendingReference] = useState(() => sessionStorage.getItem(PENDING_REF_KEY));
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(null);
  const [startingCheckoutPlanId, setStartingCheckoutPlanId] = useState(null);
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subData, plansData] = await Promise.all([getMySubscription(), listPlans()]);
      setSubscription(subData.subscription === null ? null : subData);
      setPlans(plansData);
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
      const {
        reference,
        authorizationUrl
      } = await initializeSubscription(planId);
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
      setVerifyMessage(result.alreadyProcessed ? "This payment was already confirmed earlier." : `Payment confirmed — subscription is now ${result.subscription?.status}.`);
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
  return <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-800">Subscription</h1>

      {error && <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading && <p className="mt-8 text-slate-400">Loading…</p>}

      {!loading && <>
          
          <div className="mt-6 bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500">
              {subscription?.isTrial ? "30-Day Access" : "Current Plan"}
            </p>
            {subscription && subscription.plan ? <div className="mt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xl font-semibold text-slate-800">{subscription.plan}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[subscription.status] || "bg-slate-100 text-slate-500"}`}>
                    {subscription.hasAccess ? subscription.status : "expired"}
                  </span>
                </div>

                
                {subscription.hasAccess ? <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs text-slate-500">Days remaining</p>
                      <p className="text-2xl font-semibold text-slate-800">
                        {subscription.daysRemaining}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Started</p>
                      <p className="text-sm text-slate-700 mt-1">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Ends</p>
                      <p className="text-sm text-slate-700 mt-1">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Renews</p>
                      <p className="text-sm text-slate-700 mt-1">
                        {subscription.autoRenew ? "Automatically" : "Manually"}
                      </p>
                    </div>
                  </div> : <div className="mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                    <p className="text-sm text-red-800 font-medium">
                      {subscription.isTrial ? "Your 30-day access period has expired." : "Your subscription has expired."}
                    </p>
                    <p className="text-sm text-red-700 mt-0.5">
                      Ended {new Date(subscription.endDate).toLocaleDateString()}. Choose a plan
                      below to restore access — your data, customers and settings are all still here.
                    </p>
                  </div>}
              </div> : <p className="mt-2 text-slate-500">No active subscription — choose a plan below to get started.</p>}
          </div>

          
          {verifyMessage && <div className="mt-6 rounded-md bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-700">
              {verifyMessage}
            </div>}

          
          {pendingReference && <div className="mt-6 rounded-md bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm text-amber-800">
                Checkout opened in a new tab. Complete the payment there, then come back and verify it here —
                Paystack can't confirm this automatically on a local dev server.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={handleVerify} disabled={verifying} className="rounded-md bg-slate-800 text-white px-3 py-1.5 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors">
                  {verifying ? "Verifying…" : "I've completed payment — Verify now"}
                </button>
                <button onClick={dismissPending} className="text-sm text-slate-500 hover:underline">
                  Dismiss
                </button>
              </div>
            </div>}

          
          <div className="mt-8">
            <p className="text-sm font-medium text-slate-500 mb-3">Available Plans</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {plans.map(plan => <div key={plan.id} className="bg-white rounded-lg border border-slate-200 p-5">
                  <p className="font-semibold text-slate-800">{plan.name}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-800">
                    GHS {plan.price}
                    <span className="text-sm font-normal text-slate-400"> / {plan.billingCycle}</span>
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-slate-500">
                    <li>Up to {plan.maxBranches} branches</li>
                    <li>Up to {plan.maxUsers} users</li>
                    {plan.features.map(f => <li key={f.key}>
                        {f.key}: {f.value}
                      </li>)}
                  </ul>
                  <button onClick={() => handleSubscribe(plan.id)} disabled={startingCheckoutPlanId === plan.id} className="mt-4 w-full rounded-md bg-sky-600 text-white py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50 transition-colors">
                    {startingCheckoutPlanId === plan.id ? "Starting checkout…" : "Subscribe"}
                  </button>
                </div>)}
            </div>
          </div>
        </>}
    </div>;
}
export default SubscriptionPage;