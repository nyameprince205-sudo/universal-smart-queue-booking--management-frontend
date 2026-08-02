import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";

function PlatformPage() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">Step 2 — Real Auth</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">Platform Administration</h1>
          <p className="mt-2 text-slate-500">Signed in as {profile?.name} ({profile?.email})</p>
        </div>
        <LogoutButton />
      </div>
      <p className="mt-4 text-slate-400 text-sm">Cross-tenant organization management arrives in Step 6.</p>
    </div>
  );
}

export default PlatformPage;
