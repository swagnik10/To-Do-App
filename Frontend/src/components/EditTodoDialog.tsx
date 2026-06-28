import { useEffect, useState } from 'react'

interface EditTodoDialogProps {
    isOpen: boolean
    currentText: string
    onClose: () => void
    onSave: (updatedText: string) => void
}

function EditTodoDialog({
    isOpen,
    currentText,
    onClose,
    onSave
}: EditTodoDialogProps) {
    const [editedText, setEditedText] = useState('')

    useEffect(() => {
        if (isOpen) {
            setEditedText(currentText)
        }
    }, [isOpen, currentText])

    if (!isOpen) return null

    const trimmedText = editedText.trim()

    const hasChanges = trimmedText !== currentText.trim()

    const canSave = trimmedText.length > 0 && hasChanges

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-5 sm:p-6">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">

                    <h2 className="text-xl font-semibold">
                        Edit Task
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-xl transition hover:text-red-500 cursor-pointer"
                    >
                        ✕
                    </button>

                </div>

                {/* Input */}
                <div>

                    <label className="block mb-2 font-medium">
                        Todo Title
                    </label>

                    <input
                        type="text"
                        value={editedText}
                        onChange={(e) =>
                            setEditedText(e.target.value)
                        }
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                {/* Footer */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2 border rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!canSave}
                        onClick={() => onSave(trimmedText)}
                        className={`w-full sm:w-auto px-5 py-2 rounded-lg text-white transition ${canSave
                                ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>
    )
}

export default EditTodoDialog