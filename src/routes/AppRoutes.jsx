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

// Phase 18, Module 13: everything below is lazy — every one of these pages
// lives behind a staff/admin login (ProtectedRoute), so a guest customer
// browsing /book/:slug or a fresh visitor hitting the homepage was ALWAYS
// downloading this entire admin bundle (charts, tables, the works) despite
// having zero chance of ever seeing any of it without logging in first.
// Splitting these into their own chunks means that JS only downloads the
// moment someone actually navigates to an admin page — never before.
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

// A small, deliberately quiet fallback — this shows for a fraction of a
// second on a normal connection, not a full loading-screen production;
// matches the plain "Loading…" text already used throughout this app's
// own pages (DashboardPage, AnalyticsPage, etc.) rather than introducing
// a different loading convention just for this.
function PageLoading() {
  return <div className="p-8 text-slate-400">Loading…</div>;
}

// Wraps a single lazy page in its OWN Suspense boundary, scoped to just
// that route's element — not one giant Suspense around the whole <Routes>
// tree, which would flash the ENTIRE app (sidebar included) blank on every
// navigation between two admin pages. Because AdminLayout renders its
// children through <Outlet />, this boundary only ever covers the main
// content area; the sidebar stays mounted and interactive throughout.
function Lazy({ Component }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>
  );
}

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

      {/* Org Admin — shared sidebar layout, nested routes. Every page below
          is lazy (see the top of this file) — none of it downloads until
          someone actually lands on /admin/* while logged in. */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute authType="staff" allowedRoles={["ORG_ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
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
      </Route>

      <Route
        path="/platform"
        element={
          <ProtectedRoute authType="staff" allowedRoles={["SUPER_ADMIN"]}>
            <Lazy Component={PlatformPage} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/queue"
        element={
          <ProtectedRoute authType="staff" allowedRoles={["STAFF", "ORG_ADMIN"]}>
            <Lazy Component={QueueConsolePage} />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
