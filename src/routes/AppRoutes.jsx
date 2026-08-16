import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import StaffLoginPage from "../pages/auth/StaffLoginPage";
import CustomerLoginPage from "../pages/auth/CustomerLoginPage";
import CustomerRegisterPage from "../pages/auth/CustomerRegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import CustomerForgotPasswordPage from "../pages/auth/CustomerForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ResendVerificationPage from "../pages/auth/ResendVerificationPage";
import CustomerHomePage from "../pages/customer/HomePage";
import OrgBookingPage from "../pages/customer/OrgBookingPage";
import MyBookingsPage from "../pages/customer/MyBookingsPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import TrackTicketPage from "../pages/customer/TrackTicketPage";
import OrganizationSearchPage from "../pages/customer/OrganizationSearchPage";
import RequestRegistrationPage from "../pages/customer/RequestRegistrationPage";
import OrganizationRequestsPage from "../pages/admin/OrganizationRequestsPage";
import AboutPage from "../pages/customer/AboutPage";
import ContactPage from "../pages/customer/ContactPage";
import ContactSubmissionsPage from "../pages/admin/ContactSubmissionsPage";
import CustomersPage from "../pages/admin/CustomersPage";
import StaffCustomersPage from "../pages/staff/StaffCustomersPage";
const DashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
const BranchesPage = lazy(() => import("../pages/admin/BranchesPage"));
const ServicesPage = lazy(() => import("../pages/admin/ServicesPage"));
const SubscriptionPage = lazy(() => import("../pages/admin/SubscriptionPage"));
const PlatformPage = lazy(() => import("../pages/admin/PlatformPage"));
const QueueConsolePage = lazy(() => import("../pages/staff/QueueConsolePage"));
const StaffPage = lazy(() => import("../pages/admin/StaffPage"));
const AnalyticsPage = lazy(() => import("../pages/admin/AnalyticsPage"));
const ExecutiveDashboardPage = lazy(() => import("../pages/admin/ExecutiveDashboardPage"));
const BookingsPage = lazy(() => import("../pages/admin/BookingsPage"));
const ReportsPage = lazy(() => import("../pages/admin/ReportsPage"));
const SettingsPage = lazy(() => import("../pages/admin/SettingsPage"));
function PageLoading() {
  return <div className="p-8 text-slate-400">Loading…</div>;
}
function Lazy({
  Component
}) {
  return <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>;
}
function AppRoutes() {
  return <Routes>
      
      <Route path="/" element={<CustomerHomePage />} />
      <Route path="/login" element={<StaffLoginPage />} />
      <Route path="/customer/login" element={<CustomerLoginPage />} />
      <Route path="/customer/register" element={<CustomerRegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/customer/forgot-password" element={<CustomerForgotPasswordPage />} />
      
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />
      
      <Route path="/book/:slug" element={<OrgBookingPage />} />
      <Route path="/track/:uuid" element={<TrackTicketPage />} />
      <Route path="/organizations" element={<OrganizationSearchPage />} />
      <Route path="/request-registration" element={<RequestRegistrationPage />} />

      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route path="/my-bookings" element={<ProtectedRoute authType="customer">
            <MyBookingsPage />
          </ProtectedRoute>} />
       
       <Route path="/contact-submissions" element={<ProtectedRoute authType="staff" allowedRoles={["SUPER_ADMIN"]}>
      <ContactSubmissionsPage />
    </ProtectedRoute>} />

      
      <Route path="/admin" element={<ProtectedRoute authType="staff" allowedRoles={["ORG_ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>}>
        <Route path="dashboard" element={<Lazy Component={DashboardPage} />} />
        <Route path="branches" element={<Lazy Component={BranchesPage} />} />
        <Route path="services" element={<Lazy Component={ServicesPage} />} />
        <Route path="staff" element={<Lazy Component={StaffPage} />} />
        <Route path="subscription" element={<Lazy Component={SubscriptionPage} />} />
        <Route path="analytics" element={<Lazy Component={AnalyticsPage} />} />
        <Route path="executive" element={<Lazy Component={ExecutiveDashboardPage} />} />
        <Route path="bookings" element={<Lazy Component={BookingsPage} />} />
        <Route path="reports" element={<Lazy Component={ReportsPage} />} />
        <Route path="settings" element={<Lazy Component={SettingsPage} />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>

<Route path="/organization-requests" element={<ProtectedRoute authType="staff" allowedRoles={["SUPER_ADMIN"]}>
      <OrganizationRequestsPage />
    </ProtectedRoute>} />

      <Route path="/platform" element={<ProtectedRoute authType="staff" allowedRoles={["SUPER_ADMIN"]}>
            <Lazy Component={PlatformPage} />
          </ProtectedRoute>} />
      <Route path="/staff/queue" element={<ProtectedRoute authType="staff" allowedRoles={["STAFF", "ORG_ADMIN"]}>
            <Lazy Component={QueueConsolePage} />
          </ProtectedRoute>} />
      <Route path="/staff/customers" element={<ProtectedRoute authType="staff" allowedRoles={["STAFF", "ORG_ADMIN"]}>
      <StaffCustomersPage />
    </ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>;
}
export default AppRoutes;