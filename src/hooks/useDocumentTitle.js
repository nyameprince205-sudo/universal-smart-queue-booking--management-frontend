import { useEffect } from "react";
const BASE_TITLE = "Universal Smart Queue & Booking Management System";
function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
export default useDocumentTitle;