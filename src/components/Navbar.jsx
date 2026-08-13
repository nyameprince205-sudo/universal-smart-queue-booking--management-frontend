import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

// Phase 17, Step 2. Shared across every public page (Home, Search, About,
// Contact, Request Registration) so navigation is consistent everywhere —
// one component, not five near-copies of the same bar. Collapses into a
// stacked mobile menu below `md`, same "hidden until tapped" pattern as
// AdminLayout's sidebar drawer, just horizontal-to-vertical instead of a
// side overlay, since a top nav bar doesn't need to slide over content the
// way a sidebar does.
//
// Two rows on desktop, not one — the real project name is long enough
// that squeezing it into the same single row as every nav link forced
// both the brand text AND two of the nav labels to wrap mid-word, which
// looked cramped and unintentional rather than like a real design choice.
// Giving the brand its own row lets it wrap cleanly on its own terms,
// and gives the nav links a full-width row where none of them need to
// wrap at all.
const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/organizations", label: "Search Organization" },
  { to: "/request-registration", label: "Request Organization Registration" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 md:py-4 gap-4">
          <Link
            to="/"
            className="font-semibold text-slate-800 text-base md:text-lg leading-snug"
            onClick={() => setOpen(false)}
          >
            Universal Smart Queue & Booking Management System
          </Link>

          <Link
            to="/login"
            className="hidden md:inline-block shrink-0 rounded-md bg-slate-800 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Login
          </Link>

          {/* Mobile toggle */}
          <button onClick={() => setOpen((o) => !o)} className="md:hidden shrink-0 p-1.5 text-slate-600" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desktop nav — its own row, full width, nothing else competing for space on it */}
        <div className="hidden md:flex items-center gap-6 pb-3 border-t border-slate-100 pt-3">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile stacked menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block rounded-md bg-slate-800 text-white px-3 py-2 text-sm font-medium text-center mt-2"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
