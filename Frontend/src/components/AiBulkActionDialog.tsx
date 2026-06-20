import { useState } from 'react'
import { toast } from 'react-toastify'
import {
    previewBulkActionApi,
    executeBulkActionApi
} from '../api/todoApi'

interface AiBulkActionDialogProps {
    isOpen: boolean
    onClose: () => void
    onExecuted: () => void
}

interface PreviewTodo {
    todoId: string
    todoTitle: string
    isCompleted: boolean
    category: string | null
    createdAt: string
}

interface BulkActionPreviewResponse {
    action: string
    category: string | null
    matchCount: number
    matchingTodos: PreviewTodo[]
}

function AiBulkActionDialog({
    isOpen,
    onClose,
    onExecuted
}: AiBulkActionDialogProps) {

    const [command, setCommand] = useState('')

    const [preview, setPreview] = useState<BulkActionPreviewResponse | null>(null)

    const [isLoading, setIsLoading] = useState(false)

    const [message, setMessage] = useState('')

    const handleClose = () => {
        if (isLoading) {
            return
        }

        resetDialog()

        onClose()
    }

    const handleCommandChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setCommand(e.target.value)

        setPreview(null)
        setMessage('')
    }

    const handlePreview = async () => {
        try {
            setIsLoading(true)
            setMessage('')

            const result =
                await previewBulkActionApi(command)

            setPreview(result)

            if (result.matchCount === 0) {
                setMessage(
                    'No matching todos found.'
                )
            }
        }
        catch (error: any) {
            setPreview(null)

            const errorMessage =
                error?.response?.data?.message ??
                'Unable to generate preview.'

            setMessage(errorMessage)

            toast.error(errorMessage)
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleExecute = async () => {
        if (!preview) {
            return
        }

        try {
            setIsLoading(true)

            const result =
                await executeBulkActionApi({
                    action: preview.action,
                    category: preview.category
                })

            toast.success(
                `Successfully affected ${result.affectedCount} todo(s)`
            )

            onExecuted()

            resetDialog()

            onClose()
        }
        catch {
            toast.error(
                'Failed to execute action.'
            )

            setMessage(
                'Failed to execute action.'
            )
        }
        finally {
            setIsLoading(false)
        }
    }

    const resetDialog = () => {
        setCommand('')
        setPreview(null)
        setMessage('')
        setIsLoading(false)
    }

    const canExecute =
        preview !== null &&
        preview.matchCount > 0 &&
        (
            preview.action === 'delete' ||
            preview.action === 'complete' ||
            preview.action === 'uncomplete'
        )

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

            <div className="bg-white rounded-lg p-6 w-[700px] max-h-[80vh] overflow-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">

                    <h2 className="text-lg font-semibold">
                        AI Bulk Actions
                    </h2>

                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className={`transition
                            ${isLoading
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer hover:text-red-500'
                            }`}
                    >
                        ✕
                    </button>

                </div>

                {/* Command */}
                <div>

                    <label className="block mb-2 font-medium">
                        Command
                    </label>

                    <input
                        type="text"
                        value={command}
                        disabled={isLoading}
                        onChange={handleCommandChange}
                        placeholder="Delete all shopping todos"
                        className="w-full border rounded p-2"
                    />

                </div>

                {/* Preview Button */}
                {
                    !preview && (
                        <button
                            onClick={handlePreview}
                            disabled={
                                !command.trim() ||
                                isLoading
                            }
                            className={`mt-4 w-full rounded px-4 py-2 text-white transition
                                ${!command.trim() || isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                                }`}
                        >
                            {
                                isLoading
                                    ? 'Generating Preview...'
                                    : 'Preview Action'
                            }
                        </button>
                    )
                }

                {/* Message */}
                {
                    message && (
                        <div className="mt-3 text-sm text-gray-600">
                            {message}
                        </div>
                    )
                }

                {/* Preview Result */}
                {
                    preview && (
                        <div className="mt-6 border rounded p-4">

                            <div className="mb-2">
                                <strong>Action:</strong>{' '}
                                {preview.action}
                            </div>

                            <div className="mb-2">
                                <strong>Category:</strong>{' '}
                                {preview.category ?? 'All'}
                            </div>

                            <div className="mb-4">
                                <strong>Matching Todos:</strong>{' '}
                                {preview.matchCount}
                            </div>

                            {
                                preview.action === 'select' && (
                                    <div className="mb-4 text-blue-600 font-medium">
                                        Preview only. No changes will be made.
                                    </div>
                                )
                            }

                            {
                                preview.matchCount > 0 && (
                                    <div className="max-h-64 overflow-auto">

                                        {
                                            preview.matchingTodos.map(
                                                todo => (
                                                    <div
                                                        key={todo.todoId}
                                                        className="border-b py-2"
                                                    >
                                                        <div>
                                                            {todo.todoTitle}
                                                        </div>

                                                        <div className="text-sm text-gray-500">
                                                            {todo.category ?? 'Other'}
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        }

                                    </div>
                                )
                            }

                        </div>
                    )
                }

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-2">

                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className={`px-4 py-2 border rounded transition
                            ${isLoading
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer hover:bg-gray-100'
                            }`}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleExecute}
                        disabled={!canExecute || isLoading}
                        className={`px-4 py-2 rounded text-white transition
                            ${canExecute && !isLoading
                                ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {
                            isLoading && preview
                                ? 'Executing...'
                                : 'Confirm Action'
                        }
                    </button>

                </div>

            </div>

        </div>
    )
}

export default AiBulkActionDialog