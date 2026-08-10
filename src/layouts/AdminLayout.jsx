import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Ticket, Building2, Wrench, UserCog, BarChart3,
  Gauge, FileText, CreditCard, Settings, LifeBuoy, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationBell from "../components/NotificationBell";

// Phase 18, Module 7. Icons + collapse/expand are new; active-menu
// highlighting already existed (NavLink's isActive), so that part is
// unchanged. "Customers" is deliberately NOT in this list — no backend
// endpoint lists an org's customers yet (see the delivery notes); a nav
// link to a page that can't load anything is worse than no link at all.
const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/staff/queue", label: "Queue", icon: Ticket },
  { to: "/admin/branches", label: "Branches", icon: Building2 },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/staff", label: "Staff", icon: UserCog },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/executive", label: "Executive", icon: Gauge },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/subscription", label: "Subscription", icon: CreditCard },
];

const COLLAPSE_STORAGE_KEY = "queueSaasSidebarCollapsed";

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true");

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`bg-slate-800 text-slate-200 flex flex-col shrink-0 transition-all ${collapsed ? "w-16" : "w-56"}`}>
        <div className="px-3 py-4 border-b border-slate-700 flex items-center justify-between">
          {!collapsed && <p className="text-xs font-medium tracking-wide text-slate-400 uppercase pl-2">Org Admin</p>}
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button onClick={toggleCollapsed} className="p-1.5 rounded-md hover:bg-slate-700/50 text-slate-400 shrink-0">
              {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/50"
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}

          <a
            href="mailto:support@queuesaas.example.com"
            title={collapsed ? "Support" : undefined}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            <LifeBuoy className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Support</span>}
          </a>
        </nav>

        <div className="px-2 py-3 border-t border-slate-700">
          {collapsed ? (
            <div className="flex justify-center">
              <Settings className="w-5 h-5 text-slate-400" />
            </div>
          ) : (
            <ProfileDropdown />
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
