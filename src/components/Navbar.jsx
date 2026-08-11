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
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-semibold text-slate-800 text-lg" onClick={() => setOpen(false)}>
            USQBM
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              className="rounded-md bg-slate-800 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen((o) => !o)} className="md:hidden p-1.5 text-slate-600" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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
