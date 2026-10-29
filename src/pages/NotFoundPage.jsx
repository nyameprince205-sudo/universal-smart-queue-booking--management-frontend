import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, SearchX } from "lucide-react";

function NotFoundPage() {
return ( <div className="surface-texture-subtle flex min-h-screen items-center justify-center bg-warm-bg px-4 py-12 font-sans text-warm-ink"> <div className="w-full max-w-lg text-center">
{/* Illustration */} <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center"> <div className="absolute inset-0 rounded-full bg-sky-100/70" /> <div className="absolute inset-4 rounded-full border border-sky-200 bg-white/70 shadow-sm" />


      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
        <SearchX size={38} strokeWidth={1.6} />
      </div>

      <span className="absolute right-1 top-5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 shadow-sm">
        Oops!
      </span>

      <span className="absolute bottom-5 left-0 h-3 w-3 rounded-full bg-sky-400" />
      <span className="absolute right-2 bottom-9 h-2 w-2 rounded-full bg-amber-400" />
    </div>

    {/* Error message */}
    <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
      Page not found
    </p>

    <h1 className="mt-3 text-7xl font-extrabold tracking-tight text-warm-ink sm:text-8xl">
      404
    </h1>

    <h2 className="mt-4 text-xl font-bold sm:text-2xl">
      Looks like you're off the queue!
    </h2>

    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-warm-muted sm:text-base">
      The page you're looking for may have moved, been removed, or never
      existed. Let's get you back on track.
    </p>

    {/* Navigation */}
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      >
        <Home size={17} />
        Back to Home
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

export default NotFoundPage;
