import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useDispatch, useSelector } from 'react-redux'

import { addTodo, toggleTodo, deleteTodo, type Todo, updateTodo } from '../features/todos/todoSlice'
import type { RootState } from '../app/store'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import EditTodoDialog from './EditTodoDialog'

function Todo() {
  const [text, setText] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)

  const dispatch = useDispatch()

  const todos = useSelector(
    (state: RootState) => state.todo.todos
  )

  const handleAddTodo = () => {
    if (!text.trim()) return

    dispatch(
      addTodo({
        id: nanoid(),
        text: text.trim(),
        createdTime: new Date().toISOString(),
        isCompleted: false
      })
    )

    setText('')
  }

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false)
    setSelectedTodoId(null)
  }

  const handleDelete = () => {
    if (!selectedTodoId) return

    dispatch(deleteTodo(selectedTodoId))

    closeDeleteDialog()
  }

  const handleSaveEdit = (
    updatedText: string
  ) => {
    if (!selectedTodo) return

    dispatch(
      updateTodo({
        id: selectedTodo.id,
        text: updatedText
      })
    )

    setShowEditDialog(false)
    setSelectedTodo(null)
  }

  const closeEditDialog = () => {
    setShowEditDialog(false)
    setSelectedTodo(null)
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-6">
        Todo App
      </h1>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a task"
          className="flex-1 border rounded px-3 py-2"
        />

        <button
          onClick={handleAddTodo}
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="space-y-3">
        {todos.map((todo) => (
          <div className="flex items-center justify-between border rounded p-3">
            {/* Left */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.isCompleted}
                onChange={() => dispatch(toggleTodo(todo.id))}
              />

              <span
                className={
                  todo.isCompleted
                    ? 'line-through text-gray-500'
                    : ''
                }
              >
                {todo.text}
              </span>
            </div>

            {/* Middle */}
            <span className="text-sm text-gray-500">
              {new Date(todo.createdTime).toLocaleString()}
            </span>

            {/* Right */}
            <div className="flex gap-2">
              <button className={`rounded px-4 py-2 text-white ${!todo.isCompleted
                ? 'cursor-pointer bg-blue-500'
                : 'cursor-not-allowed bg-gray-400'
                }`}
                disabled={todo.isCompleted}
                onClick={() => {
                  setSelectedTodo(todo)
                  setShowEditDialog(true)
                }}
              >
                Edit
              </button>
              <EditTodoDialog
                isOpen={showEditDialog}
                currentText={selectedTodo?.text ?? ''}
                onClose={closeEditDialog}
                onSave={handleSaveEdit}
              />
              <button
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setSelectedTodoId(todo.id)
                  setShowDeleteDialog(true)
                }}
              >
                Delete
              </button>
              {/* 
                * This pattern is called "lifting state up". 
                * We lift the state of the delete dialog to the parent component (Todo) so that it can control when to show the dialog and which todo is being deleted. 
                * The DeleteConfirmationDialog component is a child component that receives props from the parent to determine its behavior.  
                * */}
              <DeleteConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={closeDeleteDialog}
                onConfirm={handleDelete}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Todo