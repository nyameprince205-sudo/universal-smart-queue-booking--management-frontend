import { Link } from "react-router-dom";
import { Headset, ArrowUpRight, ArrowUp } from "lucide-react";

function AppFooter() {
  const year = new Date().getFullYear();

  function handleBackToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <footer className="border-t border-stone-200 bg-white px-4 py-5 font-sans sm:px-8">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand and copyright */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
            <span className="text-sm font-bold text-emerald-800">S</span>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-tight text-stone-800">
              SmartQueue
            </p>

            <p className="mt-0.5 text-xs text-stone-500">
              © {year} SmartQueue. All rights reserved.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4">
          <p className="hidden text-xs text-stone-500 md:block">
            Making every queue simpler.
          </p>

          {/* Support */}
          <Link
            to="/support"
            className="group inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-600 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <Headset className="h-4 w-4" />

            <span>Support</span>

            <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>

          {/* Back to top */}
          <button
            type="button"
            onClick={handleBackToTop}
            className="group inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-600 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            aria-label="Scroll to the top of the page"
          >
            <ArrowUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />

            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;