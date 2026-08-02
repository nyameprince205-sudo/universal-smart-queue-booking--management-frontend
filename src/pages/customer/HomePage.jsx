import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";

function CustomerHomePage() {
  const { profile, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">Step 2 — Real Auth</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            {isAuthenticated ? `Welcome, ${profile?.name}` : "Welcome"}
          </h1>
          {!isAuthenticated && <p className="mt-2 text-slate-500">Sign in to book a service or check your queue.</p>}
        </div>
        {isAuthenticated && <LogoutButton />}
      </div>
      <p className="mt-4 text-slate-400 text-sm">Booking a service and joining a queue arrive in Step 5.</p>
    </div>
  );
}

export default CustomerHomePage;
