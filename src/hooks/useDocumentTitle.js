import { useEffect } from "react";

const BASE_TITLE = "QueueSaaS";

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}

export default useDocumentTitle;
