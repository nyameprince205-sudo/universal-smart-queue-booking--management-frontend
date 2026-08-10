// bookingTime comes back from the API as a full ISO datetime anchored to
// 1970-01-01 (see booking.controller.js's createBookingCore: `new
// Date(\`1970-01-01T${bookingTime}Z\`)`) — it's just a container for a
// clock time, not a real moment in time. Reading it with getUTCHours/
// getUTCMinutes (NOT toLocaleTimeString, which would apply the browser's
// LOCAL timezone offset and silently shift the displayed hour for anyone
// not in UTC) extracts exactly the time that was actually entered.
function formatBookingTime(bookingTime) {
  if (!bookingTime) return "";
  const d = new Date(bookingTime);
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export { formatBookingTime };
