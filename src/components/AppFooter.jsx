import { Link } from "react-router-dom";
import { Headset, ArrowUpRight } from "lucide-react";

function AppFooter() {
const year = new Date().getFullYear();

return ( <footer className="border-t border-stone-200 bg-white px-4 py-5 font-sans sm:px-8"> <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
{/* Brand and copyright */} <div className="flex items-center gap-3"> <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50"> <span className="text-sm font-bold text-emerald-800">S</span> </div>


      <div>
        <p className="text-sm font-semibold tracking-tight text-stone-800">
          SmartQueue
        </p>
        <p className="mt-0.5 text-xs text-stone-500">
          © {year} SmartQueue. All rights reserved.
        </p>
      </div>
    </div>

    {/* Support link */}
    <div className="flex items-center justify-between gap-4 sm:justify-end">
      <p className="hidden text-xs text-stone-500 md:block">
        Making every queue simpler.
      </p>

      <Link
        to="/support"
        className="group inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-600 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <Headset className="h-4 w-4" />
        <span>Support</span>
        <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  </div>
</footer>


);
}

export default AppFooter;
