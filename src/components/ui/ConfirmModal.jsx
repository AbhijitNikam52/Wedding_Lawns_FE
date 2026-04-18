/**
 * Confirmation modal — replaces browser window.confirm().
 *
 * Usage:
 *   const [modal, setModal] = useState(null);
 *   <ConfirmModal
 *     isOpen={!!modal}
 *     title="Delete Lawn?"
 *     message="This cannot be undone."
 *     confirmLabel="Delete"
 *     confirmClass="bg-red-500 text-white"
 *     onConfirm={() => { handleDelete(); setModal(null); }}
 *     onCancel={() => setModal(null)}
 *   />
 */
const ConfirmModal = ({
  isOpen,
  title        = "Are you sure?",
  message      = "",
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  confirmClass = "btn-primary",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-purple-100 max-w-sm w-full p-6 z-10">
        <h3 className="text-lg font-bold text-dark mb-2">{title}</h3>
        {message && <p className="text-gray-500 text-sm mb-6">{message}</p>}

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${confirmClass}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;