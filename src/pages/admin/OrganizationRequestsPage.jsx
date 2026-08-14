import { Navigate } from "react-router-dom";

// This page has been fully absorbed into the consolidated Platform
// Dashboard (see PlatformPage.jsx's "Registration Requests" tab), which
// now also handles actually creating the organization on approval — a
// capability this standalone page never had and was never updated to
// match. Rather than maintain two copies of the same feature that could
// drift apart, this just sends anyone who still has this URL bookmarked
// to the real, current version.
function OrganizationRequestsPage() {
  return <Navigate to="/platform" replace />;
}

export default OrganizationRequestsPage;
