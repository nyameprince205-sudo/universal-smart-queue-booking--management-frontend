function Modal({
  title,
  onClose,
  children
}) {
  return <div className="fixed inset-0 bg-slate-900/40 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh] my-auto" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            &times;
          </button>
        </div>

        
        <div className="px-6 pb-6 overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>;
}
export default Modal;