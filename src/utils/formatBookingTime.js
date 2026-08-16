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