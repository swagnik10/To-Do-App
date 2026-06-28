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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">

                    <h2 className="text-xl font-semibold">
                        AI Bulk Actions
                    </h2>

                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className={`text-xl transition ${isLoading
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
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                </div>

                {/* Preview Button */}
                {!preview && (
                    <button
                        onClick={handlePreview}
                        disabled={!command.trim() || isLoading}
                        className={`mt-5 w-full rounded-lg px-4 py-3 text-white transition ${!command.trim() || isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                            }`}
                    >
                        {isLoading
                            ? 'Generating Preview...'
                            : 'Preview Action'}
                    </button>
                )}

                {/* Message */}
                {message && (
                    <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700 break-words">
                        {message}
                    </div>
                )}

                {/* Preview */}
                {preview && (

                    <div className="mt-6 rounded-xl border p-4">

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

                            <div>
                                <div className="text-sm text-gray-500">
                                    Action
                                </div>

                                <div className="font-semibold capitalize">
                                    {preview.action}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500">
                                    Category
                                </div>

                                <div className="font-semibold">
                                    {preview.category ?? 'All'}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500">
                                    Matching Todos
                                </div>

                                <div className="font-semibold">
                                    {preview.matchCount}
                                </div>
                            </div>

                        </div>

                        {preview.action === 'select' && (
                            <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 p-3">
                                Preview only. No changes will be made.
                            </div>
                        )}

                        {preview.matchCount > 0 && (

                            <div className="max-h-72 overflow-y-auto rounded-lg border">

                                {preview.matchingTodos.map((todo) => (

                                    <div
                                        key={todo.todoId}
                                        className="border-b last:border-b-0 p-3 hover:bg-gray-50"
                                    >

                                        <div className="font-medium break-words">
                                            {todo.todoTitle}
                                        </div>

                                        <div className="mt-1 text-sm text-gray-500">
                                            {todo.category ?? 'Other'}
                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                )}

                {/* Footer */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className={`w-full sm:w-auto px-5 py-2 border rounded-lg transition ${isLoading
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer hover:bg-gray-100'
                            }`}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleExecute}
                        disabled={!canExecute || isLoading}
                        className={`w-full sm:w-auto px-5 py-2 rounded-lg text-white transition ${canExecute && !isLoading
                                ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isLoading && preview
                            ? 'Executing...'
                            : 'Confirm Action'}
                    </button>

                </div>

            </div>

        </div>
    )
}

export default AiBulkActionDialog