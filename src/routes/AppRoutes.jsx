import { Routes, Route } from "react-router-dom";
import StaffLoginPage from "../pages/auth/StaffLoginPage";
import CustomerLoginPage from "../pages/auth/CustomerLoginPage";
import CustomerRegisterPage from "../pages/auth/CustomerRegisterPage";
import DashboardPage from "../pages/admin/DashboardPage";
import PlatformPage from "../pages/admin/PlatformPage";
import QueueConsolePage from "../pages/staff/QueueConsolePage";
import CustomerHomePage from "../pages/customer/HomePage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

// Still mostly a flat list, EXCEPT for /admin/*, which is now nested under
// <AdminLayout> — that's the first shared layout in the app (sidebar +
// logout), introduced now because Org Admin just gained a second page
// (Dashboard, plus Branches/Services/Subscription in later steps) that all
// need the same nav. /platform and /staff/queue stay flat for now since
// they're each still a single page — they'll get their own layouts in
// Steps 4/6 once that stops being true.
//
// The ProtectedRoute wrapping now happens ONCE around the whole <AdminLayout>
// rather than around each individual admin page — since every page inside
// it needs the same authType+role check, checking it once at the layout
// level means a new admin page added later doesn't need to remember to
// wrap itself.
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<CustomerHomePage />} />
      <Route path="/login" element={<StaffLoginPage />} />
      <Route path="/customer/login" element={<CustomerLoginPage />} />
      <Route path="/customer/register" element={<CustomerRegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Org Admin — shared sidebar layout, nested routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute authType="staff" allowedRoles={["ORG_ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>

      <Route
        path="/platform"
        element={
          <ProtectedRoute authType="staff" allowedRoles={["SUPER_ADMIN"]}>
            <PlatformPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/queue"
        element={
          <ProtectedRoute authType="staff" allowedRoles={["STAFF", "ORG_ADMIN"]}>
            <QueueConsolePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
