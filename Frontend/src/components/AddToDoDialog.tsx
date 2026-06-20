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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-96">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        Add Todo
                    </h2>

                    <button
                        onClick={handleClose}
                        disabled={isLoadingAi}
                        className={`${isLoadingAi
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                            }`}
                    >
                        ✕
                    </button>
                </div>

                {/* Title */}
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
                        className="w-full rounded border p-2"
                    />
                </div>

                {/* Category */}
                <div className="mt-4">
                    <label className="block mb-2 font-medium">
                        Category
                    </label>

                    <select
                        value={category}
                        disabled={isLoadingAi}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                        className="w-full rounded border p-2"
                    >
                        {categories.map(cat => (
                            <option
                                key={cat}
                                value={cat}
                            >
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* AI Suggestion */}
                <button
                    type="button"
                    onClick={handleAiSuggestion}
                    disabled={
                        !inputText.trim() ||
                        isLoadingAi
                    }
                    className={`mt-4 w-full rounded px-4 py-2 text-white ${!inputText.trim() || isLoadingAi
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 cursor-pointer hover:bg-purple-700'
                        }`}
                >
                    {isLoadingAi
                        ? 'Generating Suggestion...'
                        : 'Get AI Suggestion'}
                </button>

                {/* Optional AI Status */}
                {aiMessage && (
                    <div className="mt-3 text-sm text-gray-600">
                        {aiMessage}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-2">

                    <button
                        onClick={handleClose}
                        disabled={isLoadingAi}
                        className={`px-4 py-2 border rounded ${isLoadingAi
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer'
                            }`}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!inputText.trim() || isLoadingAi}
                        className={`rounded px-4 py-2 text-white ${!inputText.trim() || isLoadingAi
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer bg-blue-500'
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