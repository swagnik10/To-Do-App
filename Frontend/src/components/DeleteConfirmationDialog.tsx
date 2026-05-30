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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-96">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        Delete Task
                    </h2>

                    <button onClick={onClose} className="cursor-pointer">
                        ✕
                    </button>
                </div>

                <p className="mb-6">
                    Do you want to delete this task?
                </p>

                <div className="flex justify-end gap-2">

                    <button
                        onClick={onClose}
                        className="cursor-pointer px-4 py-2 border rounded"
                    >
                        No
                    </button>

                    <button
                        onClick={onConfirm}
                        className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Yes
                    </button>

                </div>

            </div>
        </div>
    )
}

export default DeleteConfirmationDialog