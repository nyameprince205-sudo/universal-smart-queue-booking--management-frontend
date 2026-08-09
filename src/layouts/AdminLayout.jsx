import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";

// This is the first layout in the app that wraps MULTIPLE pages with a
// shared sidebar — Step 1/2 deliberately deferred this until there was an
// actual second page to justify it (see the note this replaced in
// AppRoutes.jsx). Org Admin is that moment: Reports (this step) plus
// Branches/Services/Subscription (later steps) all live under here.
//
// Uses <Outlet /> — React Router's way of saying "render whichever child
// route matched" — rather than accepting a `children` prop, which is the
// idiomatic way to do a layout route in React Router v6+.
const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/branches", label: "Branches" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/subscription", label: "Subscription" },
  { to: "/admin/staff", label: "Staff" },
];

function AdminLayout() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-56 bg-slate-800 text-slate-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-700">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Org Admin</p>
          <p className="mt-1 font-semibold text-white truncate">{profile?.name}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/50"
                }`
              }
              
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-slate-700">
          <LogoutButton className="text-sm font-medium text-slate-300 hover:text-white transition-colors" />
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
