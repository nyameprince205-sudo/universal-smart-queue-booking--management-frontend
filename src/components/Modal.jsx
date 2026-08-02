// A plain, dependency-free modal (no headless-ui/radix) — this project
// doesn't have a component library installed, and pulling one in just for
// a modal would be a lot of new surface area for one component. Good
// enough for an admin form: click outside or the X to close, Escape works
// via the overlay's onClick since there's no focus-trap complexity needed
// here (nothing else on the page is interactive while this is open).
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
