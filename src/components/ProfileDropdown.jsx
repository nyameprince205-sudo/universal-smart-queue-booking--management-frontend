import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
ChevronDown,
Settings,
LogOut,
UserRound,
ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ProfileDropdown() {
const { profile, logout } = useAuth();

const [open, setOpen] = useState(false);
const ref = useRef(null);
const buttonRef = useRef(null);
const navigate = useNavigate();

useEffect(() => {
function handleClickOutside(event) {
if (ref.current && !ref.current.contains(event.target)) {
setOpen(false);
}
}


function handleKeyDown(event) {
  if (event.key === "Escape") {
    setOpen(false);
    buttonRef.current?.focus();
  }
}

document.addEventListener("mousedown", handleClickOutside);
document.addEventListener("touchstart", handleClickOutside);
document.addEventListener("keydown", handleKeyDown);

return () => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("touchstart", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
};


}, []);

const name = profile?.name || "User";
const email = profile?.email || "";
const role = profile?.role || "Member";

const initials = name
.trim()
.split(/\s+/)
.filter(Boolean)
.slice(0, 2)
.map((part) => part.charAt(0).toUpperCase())
.join("") || "U";

function handleLogout() {
setOpen(false);
logout();
navigate("/login", { replace: true });
}

return ( <div className="relative w-full" ref={ref}>
{/* Profile trigger */}
<button
ref={buttonRef}
type="button"
onClick={() => setOpen((previous) => !previous)}
aria-expanded={open}
aria-haspopup="menu"
className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-stone-950 ${
          open
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-transparent hover:border-white/10 hover:bg-white/5"
        }`}
>
{/* Avatar */} <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-sm font-bold text-white shadow-sm ring-1 ring-white/10">
{initials} </div>


    {/* User information */}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-white">
        {name}
      </p>

      <div className="mt-1 flex items-center gap-1.5">
        <ShieldCheck
          className="h-3 w-3 shrink-0 text-amber-400"
          aria-hidden="true"
        />

        <p className="truncate text-xs capitalize text-stone-400">
          {role.replace(/[_-]+/g, " ")}
        </p>
      </div>
    </div>

    <ChevronDown
      className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 ${
        open ? "rotate-180 text-emerald-400" : ""
      }`}
      aria-hidden="true"
    />
  </button>

  {/* Dropdown panel */}
  {open && (
    <div
      role="menu"
      aria-label="Profile menu"
      className="absolute bottom-full left-0 z-50 mb-3 w-full min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-black/20 sm:min-w-[260px]"
    >
      {/* Account details */}
      <div className="border-b border-stone-100 bg-stone-50/80 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-bold text-stone-900">
              {name}
            </p>

            {email && (
              <p className="mt-1 break-all text-xs leading-relaxed text-stone-500">
                {email}
              </p>
            )}

            <span className="mt-2 inline-flex max-w-full items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <span className="truncate">{role.replace(/[_-]+/g, " ")}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Menu actions */}
      <div className="p-2">
        <Link
          to="/admin/settings"
          role="menuitem"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 transition-colors group-hover:bg-emerald-100">
            <Settings className="h-4 w-4" aria-hidden="true" />
          </span>

          <span className="flex-1">Account settings</span>
        </Link>

        <button
          type="button"
          role="menuitem"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </span>

          <span className="flex-1">Log out</span>
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-100 px-4 py-3">
        <p className="text-center text-[10px] font-medium tracking-wide text-stone-400">
          UNIVERSAL SMART QUEUE
        </p>
      </div>
    </div>
  )}
</div>


);
}

export default ProfileDropdown;
