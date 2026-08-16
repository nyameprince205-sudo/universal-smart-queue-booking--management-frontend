import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function LogoutButton({
  className = "text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
}) {
  const {
    logout,
    authType
  } = useAuth();
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate(authType === "customer" ? "/customer/login" : "/login", {
      replace: true
    });
  }
  return <button onClick={handleLogout} className={className}>
      Log out
    </button>;
}
export default LogoutButton;