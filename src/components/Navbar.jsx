import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
}];
function Navbar() {
  const [open, setOpen] = useState(false);
  return <nav className="bg-warm-card border-b border-warm-border sticky top-0 z-40 font-sans">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 md:py-4 gap-4">
          <Link to="/" className="font-display font-semibold text-warm-ink text-base md:text-lg leading-snug" onClick={() => setOpen(false)}>
            Universal Smart Queue & Booking Management System
          </Link>

          <Link to="/login" className="hidden md:inline-block shrink-0 rounded-md bg-forest-600 text-white px-4 py-2 text-sm font-medium hover:bg-forest-700 transition-colors">
            Login
          </Link>

          
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
          {NAV_LINKS.map(link => <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm text-warm-muted-2 hover:bg-warm-bg">
              {link.label}
            </Link>)}
          <Link to="/login" onClick={() => setOpen(false)} className="block rounded-md bg-forest-600 text-white px-3 py-2 text-sm font-medium text-center mt-2">
            Login
          </Link>
        </div>}
    </nav>;
}
export default Navbar;