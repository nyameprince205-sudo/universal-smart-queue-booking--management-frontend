import { useEffect, useRef } from "react";
import { X } from "lucide-react";

function Modal({ title, onClose, children }) {
const modalRef = useRef(null);
const closeButtonRef = useRef(null);

useEffect(() => {
const previousOverflow = document.body.style.overflow;


document.body.style.overflow = "hidden";
closeButtonRef.current?.focus();

function handleKeyDown(event) {
  if (event.key === "Escape") {
    onClose();
  }

  // Keep keyboard focus inside the modal.
  if (event.key === "Tab" && modalRef.current) {
    const focusableElements = modalRef.current.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const elements = Array.from(focusableElements).filter(
      (element) => element.getClientRects().length > 0
    );

    if (elements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

document.addEventListener("keydown", handleKeyDown);

return () => {
  document.body.style.overflow = previousOverflow;
  document.removeEventListener("keydown", handleKeyDown);
};


}, [onClose]);

return (
<div
className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/50 p-3 backdrop-blur-sm sm:items-center sm:p-6"
onMouseDown={(event) => {
if (event.target === event.currentTarget) {
onClose();
}
}}
> <div
     ref={modalRef}
     role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title"
     tabIndex={-1}
     className="my-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-950/20 sm:max-h-[88vh]"
   >
{/* Modal header */} <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-100 bg-white px-5 py-4 sm:px-6 sm:py-5"> <div className="min-w-0"> <div className="mb-1 flex items-center gap-2"> <span
             className="h-1.5 w-6 rounded-full bg-emerald-600"
             aria-hidden="true"
           /> <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
Smart Queue </span> </div>


        <h2
          id="modal-title"
          className="break-words text-lg font-bold tracking-tight text-stone-900 sm:text-xl"
        >
          {title}
        </h2>
      </div>

      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    {/* Modal content */}
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
      {children}
    </div>
  </div>
</div>


);
}

export default Modal;
