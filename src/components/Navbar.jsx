import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/organizations", label: "Find Organizations" },
  { to: "/request-registration", label: "Register Your Business" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/support", label: "Support" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const { isAuthenticated, authType, profile } = useAuth();

  const isCustomer = isAuthenticated && authType === "customer";
  const firstName = profile?.name
    ? String(profile.name).trim().split(" ")[0]
    : "";

  function isActive(path) {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path ||
      location.pathname.startsWith(`${path}/`);
  }

  function closeMenu() {
    setOpen(false);
  }

  const navLinkClass = (path) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? "bg-forest-50 text-forest-700"
        : "text-warm-muted-2 hover:bg-warm-bg hover:text-forest-700"
    }`;

  return (
    <nav className="sticky top-0 z-40 border-b border-warm-border/80 bg-white/95 font-sans shadow-[0_2px_12px_rgba(13,47,31,0.04)] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main header */}
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
            onClick={closeMenu}
            className="group flex min-w-0 items-center gap-3"
            aria-label="Universal Smart Queue and Booking Management System home"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-600 text-lg font-bold text-white shadow-sm transition-colors duration-200 group-hover:bg-forest-700">
              U
            </span>

            <span className="flex min-w-0 flex-col">
              <span className="font-display text-base font-semibold leading-tight tracking-tight text-forest-900 sm:text-lg">
                Universal Smart Queue
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-warm-muted sm:text-[11px]">
                Booking Management System
              </span>
            </span>
          </Link>

          {/* Desktop authentication actions */}
          <div className="hidden shrink-0 items-center gap-4 md:flex">
            {isCustomer ? (
              <>
                <span className="text-sm text-warm-muted-2">
                  Welcome{firstName ? `, ${firstName}` : ""}
                </span>

                <Link
                  to="/my-bookings"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-forest-700 transition-colors hover:bg-forest-50"
                >
                  My Bookings
                </Link>

                <LogoutButton className="rounded-xl border border-warm-border bg-white px-4 py-2 text-sm font-semibold text-warm-ink transition-colors hover:border-forest-200 hover:bg-forest-50" />
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-forest-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-forest-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2"
              >
                Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-warm-border bg-white text-forest-700 transition-colors hover:bg-forest-50 focus:outline-none focus:ring-2 focus:ring-forest-400 md:hidden"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-2 border-t border-warm-border/70 py-2 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive(link.to) ? "page" : undefined}
              className={navLinkClass(link.to)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile navigation */}
      {open && (
        <div
          id="mobile-navigation"
          className="border-t border-warm-border bg-white px-4 py-4 shadow-lg md:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1">
            {isCustomer && (
              <div className="mb-3 rounded-xl bg-forest-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-warm-muted">
                  Signed in as
                </p>
                <p className="mt-1 font-semibold text-forest-900">
                  {firstName || "Customer"}
                </p>
              </div>
            )}

            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                aria-current={isActive(link.to) ? "page" : undefined}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-forest-50 text-forest-700"
                    : "text-warm-muted-2 hover:bg-warm-bg hover:text-forest-700"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isCustomer ? (
              <>
                <Link
                  to="/my-bookings"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-forest-700 transition-colors hover:bg-forest-50"
                >
                  My Bookings
                </Link>

                <div className="mt-3 border-t border-warm-border pt-3">
                  <LogoutButton className="block w-full rounded-xl border border-warm-border bg-white px-4 py-3 text-center text-sm font-semibold text-warm-ink transition-colors hover:bg-warm-bg" />
                </div>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-forest-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-700"
              >
                Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

