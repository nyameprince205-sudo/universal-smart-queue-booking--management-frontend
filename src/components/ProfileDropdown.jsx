import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
function ProfileDropdown() {
  const {
    profile,
    logout
  } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 text-left hover:bg-slate-700/50 rounded-md px-2 py-1.5 transition-colors">
        <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {profile?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{profile?.name}</p>
          <p className="text-xs text-slate-400 truncate">{profile?.role}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && <div className="absolute bottom-full left-0 mb-1 w-full bg-white rounded-md shadow-lg border border-slate-200 py-1 z-10">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-800">{profile?.name}</p>
            <p className="text-xs text-slate-500">{profile?.email}</p>
          </div>
          <Link to="/admin/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>}
    </div>;
}
export default ProfileDropdown;