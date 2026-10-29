import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
LayoutDashboard,
Calendar,
Ticket,
Building2,
Wrench,
UserCog,
BarChart3,
Gauge,
FileText,
CreditCard,
Settings,
LifeBuoy,
ChevronsLeft,
ChevronsRight,
Menu,
X,
Users,
PanelLeftClose,
} from "lucide-react";

import SubscriptionBanner from "../components/SubscriptionBanner";
import ProfileDropdown from "../components/ProfileDropdown";
import NotificationBell from "../components/NotificationBell";
import AppFooter from "../components/AppFooter";

const NAV_ITEMS = [
{
to: "/admin/dashboard",
label: "Dashboard",
icon: LayoutDashboard,
},
{
to: "/admin/bookings",
label: "Bookings",
icon: Calendar,
},
{
to: "/staff/queue",
label: "Queue",
icon: Ticket,
},
{
to: "/admin/branches",
label: "Branches",
icon: Building2,
},
{
to: "/admin/services",
label: "Services",
icon: Wrench,
},
{
to: "/admin/staff",
label: "Staff",
icon: UserCog,
},
{
to: "/admin/customers",
label: "Customers",
icon: Users,
},
{
to: "/admin/analytics",
label: "Analytics",
icon: BarChart3,
},
{
to: "/admin/executive",
label: "Executive",
icon: Gauge,
},
{
to: "/admin/reports",
label: "Reports",
icon: FileText,
},
{
to: "/admin/subscription",
label: "Subscription",
icon: CreditCard,
},
{
to: "/admin/support",
label: "Support",
icon: LifeBuoy,
},
];

const SETTINGS_ITEM = {
to: "/admin/settings",
label: "Settings",
icon: Settings,
};

const COLLAPSE_STORAGE_KEY = "queueSaasSidebarCollapsed";

function AdminLayout() {
const [collapsed, setCollapsed] = useState(
() => localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true"
);

const [mobileOpen, setMobileOpen] = useState(false);
const location = useLocation();

function toggleCollapsed() {
setCollapsed((previous) => {
const next = !previous;


  try {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
  } catch {
    // Keep the sidebar usable if browser storage is unavailable.
  }

  return next;
});


}

function closeMobile() {
setMobileOpen(false);
}

const isSettingsActive = location.pathname.startsWith("/admin/settings");

function renderNavItem(item) {
const Icon = item.icon;


return (
  <NavLink
    key={item.to}
    to={item.to}
    end={item.to === "/admin/dashboard"}
    onClick={closeMobile}
    title={collapsed ? item.label : undefined}
    className={({ isActive }) =>
      [
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
        "text-sm font-medium transition-all duration-200",
        collapsed ? "md:justify-center md:px-2.5" : "",
        isActive
          ? "bg-sky-500/15 text-white shadow-sm ring-1 ring-inset ring-sky-400/20"
          : "text-slate-300 hover:bg-white/[0.07] hover:text-white",
      ].join(" ")
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-sky-400" />
        )}

        <Icon
          size={19}
          strokeWidth={isActive ? 2.2 : 1.8}
          className={[
            "shrink-0 transition-colors",
            isActive
              ? "text-sky-300"
              : "text-slate-400 group-hover:text-slate-200",
          ].join(" ")}
        />

        <span
          className={[
            "truncate",
            collapsed ? "md:hidden" : "",
          ].join(" ")}
        >
          {item.label}
        </span>

        {collapsed && (
          <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 md:block">
            {item.label}
          </span>
        )}
      </>
    )}
  </NavLink>
);


}

return ( <div className="surface-texture-subtle flex min-h-screen bg-warm-bg font-sans text-warm-ink">
{/* Mobile top bar */} <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-700/70 bg-slate-900 px-4 py-3 text-white shadow-lg md:hidden"> <div className="flex min-w-0 items-center gap-3">
<button
type="button"
onClick={() => setMobileOpen(true)}
aria-label="Open navigation menu"
aria-expanded={mobileOpen}
className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
> <Menu size={21} /> </button>


      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
        <Ticket size={19} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-tight">
          Smart Queue
        </p>
        <p className="text-[11px] text-slate-400">
          Organisation Admin
        </p>
      </div>
    </div>

    <div className="flex shrink-0 items-center">
      <NotificationBell />
    </div>
  </header>

  {/* Mobile backdrop */}
  {mobileOpen && (
    <button
      type="button"
      aria-label="Close navigation menu"
      className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] md:hidden"
      onClick={closeMobile}
    />
  )}

  {/* Sidebar */}
  <aside
    className={[
      "fixed inset-y-0 left-0 z-50 flex w-72 flex-col",
      "border-r border-slate-800 bg-slate-900 text-slate-200",
      "shadow-2xl transition-all duration-300 ease-in-out",
      mobileOpen ? "translate-x-0" : "-translate-x-full",
      "md:sticky md:top-0 md:z-20 md:h-screen md:translate-x-0 md:shadow-none",
      collapsed ? "md:w-[76px]" : "md:w-64",
    ].join(" ")}
  >
    {/* Sidebar brand */}
    <div
      className={[
        "flex h-[76px] shrink-0 items-center border-b border-white/[0.08] px-4",
        collapsed ? "md:justify-center md:px-2" : "justify-between",
      ].join(" ")}
    >
      <div
        className={[
          "flex min-w-0 items-center gap-3",
          collapsed ? "md:hidden" : "",
        ].join(" ")}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-950/30">
          <Ticket size={22} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-white">
            Smart Queue
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Management Portal
          </p>
        </div>
      </div>

      {collapsed && (
        <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white md:flex">
          <Ticket size={21} />
        </div>
      )}

      <div
        className={[
          "flex items-center gap-1",
          collapsed ? "md:hidden" : "",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Close navigation menu"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white md:hidden"
        >
          <X size={19} />
        </button>

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white md:inline-flex"
        >
          <ChevronsLeft size={19} />
        </button>
      </div>

      {!collapsed && (
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white md:inline-flex"
        >
          <ChevronsLeft size={19} />
        </button>
      )}
    </div>

    {/* Sidebar navigation */}
    <nav
      aria-label="Admin navigation"
      className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-5"
    >
      <p
        className={[
          "mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500",
          collapsed ? "md:hidden" : "",
        ].join(" ")}
      >
        Workspace
      </p>

      {NAV_ITEMS.slice(0, 7).map(renderNavItem)}

      <p
        className={[
          "mb-3 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500",
          collapsed ? "md:hidden" : "",
        ].join(" ")}
      >
        Insights & Management
      </p>

      {NAV_ITEMS.slice(7).map(renderNavItem)}

      <div className="!mt-5 border-t border-white/[0.08] pt-4">
        {renderNavItem(SETTINGS_ITEM)}
      </div>
    </nav>

    {/* Sidebar footer */}
    <div className="shrink-0 border-t border-white/[0.08] p-3">
      {collapsed ? (
        <div className="hidden justify-center md:flex">
          <button
            type="button"
            onClick={toggleCollapsed}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="rounded-xl p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronsRight size={19} />
          </button>
        </div>
      ) : null}

      <div className={collapsed ? "md:hidden" : ""}>
        <ProfileDropdown />
      </div>

      {collapsed && (
        <div className="mt-2 flex justify-center md:hidden">
          <ProfileDropdown />
        </div>
      )}

      {!collapsed && (
        <div className="mt-3 px-2 pb-1 text-[10px] text-slate-500">
          Universal Smart Queue
        </div>
      )}
    </div>
  </aside>

  {/* Main content */}
  <main className="min-w-0 flex-1 pt-[65px] md:pt-0">
    {/* Desktop toolbar */}
    <div className="sticky top-0 z-10 hidden h-[76px] items-center justify-between border-b border-warm-border bg-white/85 px-6 backdrop-blur-xl lg:flex xl:px-8">
      <div className="min-w-0">
        <p className="text-xs font-medium text-warm-muted">
          Organisation workspace
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-warm-ink">
          Manage your operations in one place
        </p>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="h-8 w-px bg-warm-border" />
        <ProfileDropdown />
      </div>
    </div>

    <div className="min-h-[calc(100vh-65px)] md:min-h-screen">
      <SubscriptionBanner />

      <div className="min-w-0">
        <Outlet />
      </div>

      <AppFooter />
    </div>
  </main>
</div>


);
}

export default AdminLayout;
