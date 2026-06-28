interface DeleteConfirmationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

function DeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm
}: DeleteConfirmationDialogProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-sm rounded-xl bg-white shadow-xl p-5 sm:p-6">

                {/* Header */}
                <div className="mb-5 flex items-center justify-between">

                    <h2 className="text-xl font-semibold">
                        Delete Task
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-xl transition hover:text-red-500 cursor-pointer"
                    >
                        ✕
                    </button>

                </div>

                {/* Message */}
                <p className="text-gray-700 break-words">
                    Are you sure you want to delete this task?
                </p>

                {/* Footer */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2 border rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="w-full sm:w-auto px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    )
}

export default DeleteConfirmationDialog