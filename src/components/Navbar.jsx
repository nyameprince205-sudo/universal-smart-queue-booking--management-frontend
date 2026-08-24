import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
const NAV_LINKS = [{
  to: "/",
  label: "Home"
}, {
  to: "/organizations",
  label: "Search Organization"
}, {
  to: "/request-registration",
  label: "Request Organization Registration"
}, {
  to: "/about",
  label: "About"
}, {
  to: "/contact",
  label: "Contact"
}, {
  to: "/support",
  label: "Support"
}];
function Navbar() {
  const [open, setOpen] = useState(false);
  const {
    isAuthenticated,
    authType,
    profile
  } = useAuth();
  const isCustomer = isAuthenticated && authType === "customer";
  const firstName = profile?.name ? String(profile.name).trim().split(" ")[0] : "";
  return <nav className="bg-warm-card border-b border-warm-border sticky top-0 z-40 font-sans chrome-shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 md:py-4 gap-4">
          <Link to="/" className="font-display font-semibold text-warm-ink text-base md:text-lg leading-snug" onClick={() => setOpen(false)}>
            Universal Smart Queue & Booking Management System
          </Link>

          {isCustomer ? <div className="hidden md:flex items-center gap-4 shrink-0">
              <span className="text-sm text-warm-muted-2 whitespace-nowrap">
                Hi, {firstName}
              </span>
              <Link to="/my-bookings" className="text-sm text-forest-600 hover:underline whitespace-nowrap">
                My Bookings
              </Link>
              <LogoutButton className="rounded-md border border-warm-border text-warm-ink px-4 py-2 text-sm font-medium hover:bg-warm-bg transition-colors whitespace-nowrap" />
            </div> : <Link to="/login" className="hidden md:inline-block shrink-0 rounded-md bg-forest-600 text-white px-4 py-2 text-sm font-medium hover:bg-forest-700 transition-colors">
              Login
            </Link>}

          
          <button onClick={() => setOpen(o => !o)} className="md:hidden shrink-0 p-1.5 text-warm-muted-2" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        
        <div className="hidden md:flex items-center gap-6 pb-3 border-t border-warm-border pt-3">
          {NAV_LINKS.map(link => <Link key={link.to} to={link.to} className="text-sm text-warm-muted-2 hover:text-forest-600 transition-colors whitespace-nowrap">
              {link.label}
            </Link>)}
        </div>
      </div>

      
      {open && <div className="md:hidden border-t border-warm-border px-4 py-3 space-y-1">
          {isCustomer && <p className="px-3 py-2 text-sm font-medium text-warm-ink border-b border-warm-border mb-1">
              Hi, {firstName}
            </p>}

          {NAV_LINKS.map(link => <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm text-warm-muted-2 hover:bg-warm-bg">
              {link.label}
            </Link>)}

          {isCustomer ? <>
              <Link to="/my-bookings" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm text-forest-600 hover:bg-warm-bg">
                My Bookings
              </Link>
              <div className="pt-2 mt-1 border-t border-warm-border">
                <LogoutButton className="block w-full rounded-md border border-warm-border text-warm-ink px-3 py-2 text-sm font-medium text-center hover:bg-warm-bg transition-colors" />
              </div>
            </> : <Link to="/login" onClick={() => setOpen(false)} className="block rounded-md bg-forest-600 text-white px-3 py-2 text-sm font-medium text-center mt-2">
              Login
            </Link>}
        </div>}
    </nav>;
}
export default Navbar;