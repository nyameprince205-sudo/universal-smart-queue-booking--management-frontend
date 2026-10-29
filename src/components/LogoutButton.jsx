import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function LogoutButton({
className = "",
showIcon = true,
iconOnly = false,
}) {
const { logout, authType } = useAuth();
const navigate = useNavigate();

function handleLogout() {
logout();


navigate(
  authType === "customer" ? "/customer/login" : "/login",
  { replace: true }
);


}

if (iconOnly) {
return (
<button
type="button"
onClick={handleLogout}
aria-label="Log out"
title="Log out"
className={`inline-flex h-10 w-10 items-center justify-center rounded-xl
          border border-stone-200 bg-white text-stone-600
          transition-all duration-200 hover:border-red-200
          hover:bg-red-50 hover:text-red-600
          focus:outline-none focus:ring-2 focus:ring-red-500
          focus:ring-offset-2 ${className}`}
> <LogOut className="h-4 w-4" aria-hidden="true" /> </button>
);
}

return (
<button
type="button"
onClick={handleLogout}
className={`inline-flex items-center justify-center gap-2 rounded-xl
        px-4 py-2.5 text-sm font-semibold
        text-stone-600 transition-all duration-200
        hover:bg-red-50 hover:text-red-600
        focus:outline-none focus:ring-2 focus:ring-red-500
        focus:ring-offset-2 ${className}`}
>
{showIcon && ( <LogOut className="h-4 w-4" aria-hidden="true" />
)}


  <span>Log out</span>
</button>


);
}

export default LogoutButton;
