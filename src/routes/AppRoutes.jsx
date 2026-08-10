import { Routes, Route } from "react-router-dom";
import StaffLoginPage from "../pages/auth/StaffLoginPage";
import CustomerLoginPage from "../pages/auth/CustomerLoginPage";
import CustomerRegisterPage from "../pages/auth/CustomerRegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import CustomerForgotPasswordPage from "../pages/auth/CustomerForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ResendVerificationPage from "../pages/auth/ResendVerificationPage";
import DashboardPage from "../pages/admin/DashboardPage";
import BranchesPage from "../pages/admin/BranchesPage";
import ServicesPage from "../pages/admin/ServicesPage";
import SubscriptionPage from "../pages/admin/SubscriptionPage";
import PlatformPage from "../pages/admin/PlatformPage";
import QueueConsolePage from "../pages/staff/QueueConsolePage";
import CustomerHomePage from "../pages/customer/HomePage";
import OrgBookingPage from "../pages/customer/OrgBookingPage";
import MyBookingsPage from "../pages/customer/MyBookingsPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import StaffPage from "../pages/admin/StaffPage";
import TrackTicketPage from "../pages/customer/TrackTicketPage";
import OrganizationSearchPage from "../pages/customer/OrganizationSearchPage";
import AnalyticsPage from "../pages/admin/AnalyticsPage";
import ExecutiveDashboardPage from "../pages/admin/ExecutiveDashboardPage";
import BookingsPage from "../pages/admin/BookingsPage";
import ReportsPage from "../pages/admin/ReportsPage";
import SettingsPage from "../pages/admin/SettingsPage";

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

      {/* Tasks 1/2/3: forgot/reset password + email verification. All public
          — someone who's locked out or unverified has no session to protect
          these routes with in the first place. */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/customer/forgot-password" element={<CustomerForgotPasswordPage />} />
      {/* SHARED between staff and customer resets — see ResetPasswordPage's
          own comment for why one page/route serves both account types. */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />
      {/* /book/:slug is public on purpose — see the comment on CustomerHomePage
          about there being no organization directory. Anyone with a specific
          business's link can view it; only submitting a booking requires login,
          which OrgBookingPage itself handles rather than a ProtectedRoute wrapper. */}
      <Route path="/book/:slug" element={<OrgBookingPage />} />
      <Route path="/track/:uuid" element={<TrackTicketPage />} />
      <Route path="/organizations" element={<OrganizationSearchPage />} />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute authType="customer">
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />

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
        <Route path="branches" element={<BranchesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="executive" element={<ExecutiveDashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        
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
