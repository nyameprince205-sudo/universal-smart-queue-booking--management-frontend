import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// A standalone component rather than inlined in each page — Steps 3-6 will
// each replace these placeholder pages with real ones, and every one of
// them will still need a logout button somewhere (in a real nav bar by
// then). Keeping the logic here means that migration is "drop this
// component into the new layout," not "rewrite logout in six places."
//
// `className` is overridable because this button now lives in two visually
// different contexts: the original light-background placeholder pages, and
// the new dark sidebar in AdminLayout — one fixed color scheme wouldn't
// have enough contrast in both places.
function LogoutButton({ className = "text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors" }) {
  const { logout, authType } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate(authType === "customer" ? "/customer/login" : "/login", { replace: true });
  }

  return (
    <button onClick={handleLogout} className={className}>
      Log out
    </button>
  );
}

export default LogoutButton;
