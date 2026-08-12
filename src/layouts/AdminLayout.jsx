import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Ticket, Building2, Wrench, UserCog, BarChart3,
  Gauge, FileText, CreditCard, Settings, LifeBuoy, ChevronsLeft, ChevronsRight,
  Menu, X, Users,
} from "lucide-react";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationBell from "../components/NotificationBell";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/staff/queue", label: "Queue", icon: Ticket },
  { to: "/admin/branches", label: "Branches", icon: Building2 },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/staff", label: "Staff", icon: UserCog },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/executive", label: "Executive", icon: Gauge },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/subscription", label: "Subscription", icon: CreditCard },
];

const COLLAPSE_STORAGE_KEY = "queueSaasSidebarCollapsed";

// Phase 18, Module 12: two INDEPENDENT concerns live in this one component
// now — desktop collapse (icon-only vs full-width, unchanged from before)
// and mobile drawer (hidden off-screen vs slid-in overlay, new). They're
// independent on purpose: collapsing to icons only makes sense when there's
// still a visible sidebar taking up permanent space (desktop); on mobile
// the sidebar is either a full-width overlay or entirely gone, so "collapsed
// to icons" isn't a meaningful state there at all.
function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true");
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile top bar — only rendered below the md breakpoint. Desktop
          never sees this at all; the sidebar itself is always visible there. */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-slate-800 text-white flex items-center justify-between px-4 py-3">
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-1">
          <Menu className="w-5 h-5" />
        </button>
        <p className="text-sm font-medium">Org Admin</p>
        <NotificationBell />
      </div>

      {/* Backdrop — clicking anywhere outside the open drawer closes it,
          same affordance as the ProfileDropdown/NotificationBell dropdowns
          already use elsewhere in this app. */}
      {mobileOpen && <div className="md:hidden fixed inset-0 bg-black/40 z-30" onClick={closeMobile} />}

      {/* w-64 is the MOBILE base width (used whenever the md: override
          below isn't active); md:w-16/md:w-56 overrides it at the md
          breakpoint for the desktop collapse behavior — this is the normal
          Tailwind responsive-override pattern, not two competing widths. */}
      <aside
        className={`bg-slate-800 text-slate-200 flex flex-col shrink-0 transition-all fixed inset-y-0 left-0 z-40 w-64 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:z-auto ${collapsed ? "md:w-16" : "md:w-56"}`}
      >
        <div className="px-3 py-4 border-b border-slate-700 flex items-center justify-between">
          {!collapsed && <p className="text-xs font-medium tracking-wide text-slate-400 uppercase pl-2 hidden md:block">Org Admin</p>}
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase pl-2 md:hidden">Org Admin</p>
          <div className="flex items-center gap-1">
            <div className="hidden md:block">
              <NotificationBell />
            </div>
            <button onClick={toggleCollapsed} className="hidden md:block p-1.5 rounded-md hover:bg-slate-700/50 text-slate-400 shrink-0">
              {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
            <button onClick={closeMobile} aria-label="Close menu" className="md:hidden p-1.5 rounded-md hover:bg-slate-700/50 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/50"
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className={collapsed ? "truncate md:hidden" : "truncate"}>{item.label}</span>
            </NavLink>
          ))}

          <a
            href="mailto:support@queuesaas.example.com"
            onClick={closeMobile}
            title={collapsed ? "Support" : undefined}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            <LifeBuoy className="w-4 h-4 shrink-0" />
            <span className={collapsed ? "truncate md:hidden" : "truncate"}>Support</span>
          </a>
        </nav>

        <div className="px-2 py-3 border-t border-slate-700">
          {collapsed ? (
            <>
              <div className="hidden md:flex justify-center">
                <Settings className="w-5 h-5 text-slate-400" />
              </div>
              <div className="md:hidden">
                <ProfileDropdown />
              </div>
            </>
          ) : (
            <ProfileDropdown />
          )}
        </div>
      </aside>

      {/* pt-14 clears the fixed mobile top bar; md:pt-0 removes that
          padding once the layout switches to the always-visible sidebar,
          which needs no reserved space up top. */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
