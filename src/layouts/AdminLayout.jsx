import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import SubscriptionBanner from "../components/SubscriptionBanner";
import { LayoutDashboard, Calendar, Ticket, Building2, Wrench, UserCog, BarChart3, Gauge, FileText, CreditCard, Settings, LifeBuoy, ChevronsLeft, ChevronsRight, Menu, X, Users } from "lucide-react";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationBell from "../components/NotificationBell";
const NAV_ITEMS = [{
  to: "/admin/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard
}, {
  to: "/admin/bookings",
  label: "Bookings",
  icon: Calendar
}, {
  to: "/staff/queue",
  label: "Queue",
  icon: Ticket
}, {
  to: "/admin/branches",
  label: "Branches",
  icon: Building2
}, {
  to: "/admin/services",
  label: "Services",
  icon: Wrench
}, {
  to: "/admin/staff",
  label: "Staff",
  icon: UserCog
}, {
  to: "/admin/customers",
  label: "Customers",
  icon: Users
}, {
  to: "/admin/analytics",
  label: "Analytics",
  icon: BarChart3
}, {
  to: "/admin/executive",
  label: "Executive",
  icon: Gauge
}, {
  to: "/admin/reports",
  label: "Reports",
  icon: FileText
}, {
  to: "/admin/subscription",
  label: "Subscription",
  icon: CreditCard
}, {
  to: "/admin/support",
  label: "Support",
  icon: LifeBuoy
}];
const COLLAPSE_STORAGE_KEY = "queueSaasSidebarCollapsed";
function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true");
  const [mobileOpen, setMobileOpen] = useState(false);
  function toggleCollapsed() {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  }
  function closeMobile() {
    setMobileOpen(false);
  }
  return <div className="min-h-screen bg-warm-bg flex">
      
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-slate-800 text-white flex items-center justify-between px-4 py-3">
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-1">
          <Menu className="w-5 h-5" />
        </button>
        <p className="text-sm font-medium">Org Admin</p>
        <NotificationBell />
      </div>

      
      {mobileOpen && <div className="md:hidden fixed inset-0 bg-black/40 z-30" onClick={closeMobile} />}

      
      <aside className={`bg-slate-800 text-slate-200 flex flex-col shrink-0 transition-all fixed inset-y-0 left-0 z-40 w-64 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:z-auto ${collapsed ? "md:w-16" : "md:w-56"}`}>
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
          {NAV_ITEMS.map(item => <NavLink key={item.to} to={item.to} onClick={closeMobile} title={collapsed ? item.label : undefined} className={({
          isActive
        }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/50"}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className={collapsed ? "truncate md:hidden" : "truncate"}>{item.label}</span>
            </NavLink>)}

          <NavLink to="/admin/settings" onClick={closeMobile} title={collapsed ? "Settings" : undefined} className={({
          isActive
        }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/50"}`}>
            <Settings className="w-4 h-4 shrink-0" />
            <span className={collapsed ? "truncate md:hidden" : "truncate"}>Settings</span>
          </NavLink>
        </nav>

        <div className="px-2 py-3 border-t border-slate-700">
          {collapsed ? <>
              <div className="hidden md:flex justify-center">
                <Settings className="w-5 h-5 text-slate-400" />
              </div>
              <div className="md:hidden">
                <ProfileDropdown />
              </div>
            </> : <ProfileDropdown />}
        </div>
      </aside>

      
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        
        <SubscriptionBanner />
        <Outlet />
      </main>
    </div>;
}
export default AdminLayout;