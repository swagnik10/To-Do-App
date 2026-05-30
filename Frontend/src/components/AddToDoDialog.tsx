import { useState } from 'react'

interface AddTodoDialogProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (text: string) => void
}

function AddTodoDialog({
    isOpen,
    onClose,
    onAdd
}: AddTodoDialogProps) {
    const [inputText, setInputText] = useState('')

    const handleSave = () => {
        onAdd(inputText)
        setInputText('')
    }

    const handleClose = () => {
        onClose()
        setInputText('')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-96">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        Add Todo
                    </h2>

                    <button onClick={handleClose} className="cursor-pointer">
                        ✕
                    </button>
                </div>

                <p className="mb-6">
                    Add Todo Content Here
                </p>

                {/* Input */}
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) =>
                        setInputText(e.target.value)
                    }
                    className="w-full rounded border p-2"
                />

                <div className="mt-6 flex justify-end gap-2">

                    <button
                        onClick={handleClose}
                        className="cursor-pointer px-4 py-2 border rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                    className={`rounded px-4 py-2 text-white ${inputText.trim().length > 0
                                ? 'cursor-pointer bg-blue-500'
                                : 'cursor-not-allowed bg-gray-400'
                            }`}
                    >
                    Save
                </button>

            </div>

        </div>
        </div >
    )
}

export default AddTodoDialog