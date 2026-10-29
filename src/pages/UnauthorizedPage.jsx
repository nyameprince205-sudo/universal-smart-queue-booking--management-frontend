import { Link } from "react-router-dom";
import {
ArrowLeft,
ArrowRight,
ShieldAlert,
Home,
LockKeyhole,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getHomeRouteForRole } from "../routes/roleHomeRoutes";

function UnauthorizedPage() {
const { profile } = useAuth();

const homeRoute = profile
? getHomeRouteForRole(profile.role)
: "/login";

return ( <div className="surface-texture-subtle flex min-h-screen items-center justify-center bg-warm-bg px-4 py-12 font-sans text-warm-ink"> <div className="w-full max-w-lg text-center">
{/* Illustration */} <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center"> <div className="absolute inset-0 rounded-full bg-rose-100/70" />


      <div className="absolute inset-4 flex items-center justify-center rounded-full border border-rose-200 bg-white/70 shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-600 text-white shadow-lg shadow-rose-600/20">
          <ShieldAlert size={38} strokeWidth={1.6} />
        </div>
      </div>

      <span className="absolute right-1 top-5 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-bold text-rose-700 shadow-sm">
        Restricted
      </span>

      <span className="absolute bottom-5 left-0 flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
        <LockKeyhole size={17} />
      </span>
    </div>

    {/* Error message */}
    <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-700">
      Error 403
    </p>

    <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
      Access denied
    </h1>

    <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-warm-muted sm:text-base">
      Your account doesn't have permission to access this page. You can
      return to your dashboard or contact your administrator if you believe
      you should have access.
    </p>

    {/* Navigation */}
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Link
        to={homeRoute}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      >
        <Home size={17} />
        Back to Dashboard
        <ArrowRight size={16} />
      </Link>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-warm-border bg-white px-5 py-3 text-sm font-semibold text-warm-ink transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
      >
        <ArrowLeft size={17} />
        Go Back
      </button>
    </div>

    {/* Footer */}
    <div className="mt-12 border-t border-warm-border pt-5">
      <p className="text-xs text-warm-muted">
        Universal Smart Queue & Booking Management System
      </p>
    </div>
  </div>
</div>


);
}

export default UnauthorizedPage;
