import { useState } from 'react'
import { getAiSuggestionApi } from '../api/todoApi'

interface AddTodoDialogProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (text: string, category: string | 'Other') => void
}

function AddTodoDialog({
    isOpen,
    onClose,
    onAdd
}: AddTodoDialogProps) {
    const [inputText, setInputText] = useState('')

    const handleSave = () => {
        onAdd(inputText, category)
        setInputText('')
        handleClose()
    }

    const handleClose = () => {
        onClose()
        setInputText('')
        setCategory('Other')
        setIsLoadingAi(false)
        setAiMessage('')
    }


    const [category, setCategory] = useState<string>('Other')

    const [isLoadingAi, setIsLoadingAi] = useState(false)

    const [aiMessage, setAiMessage] = useState('')

    const categories = [
        'Work',
        'Personal',
        'Health',
        'Shopping',
        'Urgent',
        'Other'
    ]

    const handleAiSuggestion = async () => {
        try {
            setIsLoadingAi(true)
            setAiMessage('')

            const response =
                await getAiSuggestionApi(inputText)

            if (response.success) {
                setInputText(response.suggestedTitle)
                setCategory(response.category)

                setAiMessage(
                    'AI suggestion applied successfully.'
                )
            }
            else {
                setAiMessage(
                    response.message ??
                    'Unable to generate suggestion.'
                )
            }
        }
        catch {
            setAiMessage(
                'Failed to connect to AI service.'
            )
        }
        finally {
            setIsLoadingAi(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">

                    <h2 className="text-xl font-semibold">
                        Add Todo
                    </h2>

                    <button
                        onClick={handleClose}
                        disabled={isLoadingAi}
                        className={`text-xl ${isLoadingAi
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer hover:text-red-500'
                            }`}
                    >
                        ✕
                    </button>

                </div>

                {/* Todo Title */}
                <div>

                    <label className="block mb-2 font-medium">
                        Todo Title
                    </label>

                    <input
                        type="text"
                        value={inputText}
                        disabled={isLoadingAi}
                        onChange={(e) =>
                            setInputText(e.target.value)
                        }
                        placeholder="Enter todo title..."
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                </div>

                {/* Category */}
                <div className="mt-5">

                    <label className="block mb-2 font-medium">
                        Category
                    </label>

                    <select
                        value={category}
                        disabled={isLoadingAi}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {categories.map((cat) => (
                            <option
                                key={cat}
                                value={cat}
                            >
                                {cat}
                            </option>
                        ))}
                    </select>

                </div>

                {/* AI Button */}
                <button
                    type="button"
                    onClick={handleAiSuggestion}
                    disabled={
                        !inputText.trim() ||
                        isLoadingAi
                    }
                    className={`mt-5 w-full rounded-lg px-4 py-3 text-white transition ${!inputText.trim() || isLoadingAi
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                        }`}
                >
                    {isLoadingAi
                        ? 'Generating Suggestion...'
                        : 'Get AI Suggestion'}
                </button>

                {/* AI Status */}
                {aiMessage && (
                    <div className="mt-3 rounded-lg bg-gray-100 p-3 text-sm text-gray-700 break-words">
                        {aiMessage}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                    <button
                        onClick={handleClose}
                        disabled={isLoadingAi}
                        className={`w-full sm:w-auto px-5 py-2 border rounded-lg ${isLoadingAi
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer hover:bg-gray-100'
                            }`}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={
                            !inputText.trim() ||
                            isLoadingAi
                        }
                        className={`w-full sm:w-auto px-5 py-2 rounded-lg text-white transition ${!inputText.trim() || isLoadingAi
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                            }`}
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>
    )
}

export default AddTodoDialog