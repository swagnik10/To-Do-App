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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-lg bg-white p-6">

                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Edit Task
                    </h2>

                    <button
                        onClick={onClose}
                        className="cursor-pointer text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Input */}
                <input
                    type="text"
                    value={editedText}
                    onChange={(e) =>
                        setEditedText(e.target.value)
                    }
                    className="w-full rounded border p-2"
                />

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded border px-4 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!canSave}
                        onClick={() => onSave(trimmedText)}
                        className={`rounded px-4 py-2 text-white ${canSave
                                ? 'cursor-pointer bg-blue-500'
                                : 'cursor-not-allowed bg-gray-400'
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