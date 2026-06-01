import { useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import { useDispatch, useSelector } from 'react-redux'

import { createTodoAsync, fetchTodosAsync, deleteTodoAsync, updateTodoAsync, toggleTodoAsync, type Todo } from '../features/todos/todoSlice'
import type { AppDispatch, RootState } from '../app/store'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import EditTodoDialog from './EditTodoDialog'
import AddTodoDialog from './AddToDoDialog'
import Pagination from './Pagination'

function TodoOperations() {
  const [searchText, setSearchText] = useState('')

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const ITEMS_PER_PAGE = 5

  const dispatch = useDispatch<AppDispatch>()

  const todos = useSelector(
    (state: RootState) => state.todo.todos
  )

  const filteredTodos = todos
    .filter((todo) => {
      const matchesSearch =
        todo.text
          .toLowerCase()
          .includes(searchText.toLowerCase())

      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'active'
            ? !todo.isCompleted
            : todo.isCompleted

      return matchesSearch && matchesFilter
    })
    .sort(
      (a, b) =>
        new Date(b.createdTime).getTime() -
        new Date(a.createdTime).getTime()
    )

  const totalPages = Math.ceil(
    filteredTodos.length / ITEMS_PER_PAGE
  )

  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleAddTodo = (inputText: string) => {
    if (!inputText.trim()) return

    dispatch(
      createTodoAsync({
        id: nanoid(),
        text: inputText.trim(),
        createdTime: new Date().toISOString(),
        isCompleted: false
      })
    )
    closeAddDialog()
  }

  const handleDelete = () => {
    if (!selectedTodoId) return

    dispatch(deleteTodoAsync(selectedTodoId))

    closeDeleteDialog()
  }

  const handleSaveEdit = async (updatedText: string) => {
    if (!selectedTodo) return

    await dispatch(updateTodoAsync({
      ...selectedTodo,
      text: updatedText
    })
    )

    setShowEditDialog(false)
    setSelectedTodo(null)
  }

  const toggleTodo = async (todo: Todo) => {
    await dispatch(toggleTodoAsync({
      ...todo,
      isCompleted: !todo.isCompleted
    }))

  }

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false)
    setSelectedTodoId(null)
  }

  const closeAddDialog = () => {
    setShowAddDialog(false)
  }

  const closeEditDialog = () => {
    setShowEditDialog(false)
    setSelectedTodo(null)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, filter])

  useEffect(() => {
    dispatch(fetchTodosAsync())
  }, [dispatch])

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url(../assets/todo-background.jpg)"
      }}
    >
      <div className="min-h-screen bg-black/60">

        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* Header */}
          <h1 className="text-5xl font-bold text-white text-center mb-10">
            Todo App
          </h1>

          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">

            <div className="flex items-center justify-between gap-4">

              {/* Search */}
              <div className="w-1/3">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search todos..."
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">

                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg ${filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'border'
                    }`}
                >
                  All
                </button>

                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-lg ${filter === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'border'
                    }`}
                >
                  Active
                </button>

                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-lg ${filter === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'border'
                    }`}
                >
                  Completed
                </button>

              </div>

              {/* Add Todo */}
              <button
                onClick={() => setShowAddDialog(true)}
                className="bg-green-500 text-white px-5 py-2 rounded-lg cursor-pointer"
              >
                + Add Todo
              </button>

            </div>

          </div>

          {/* Todo List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">

            {paginatedTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center px-6 py-4 border-b last:border-b-0 hover:bg-gray-50"
              >

                {/* Left */}
                <div className="flex items-center gap-3 flex-1">

                  <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={() =>
                      toggleTodo(todo)
                    }
                    className="h-5 w-5"
                  />

                  <span
                    className={`font-medium ${todo.isCompleted
                      ? 'line-through text-gray-400'
                      : 'text-gray-800'
                      }`}
                  >
                    {todo.text}
                  </span>

                </div>

                {/* Middle */}
                <div className="flex-1 text-center text-sm text-gray-500">
                  {new Date(
                    todo.createdTime
                  ).toLocaleString()}
                </div>

                {/* Right */}
                <div className="flex-1 flex justify-end gap-2 ml-8">

                  <button
                    disabled={todo.isCompleted}
                    onClick={() => {
                      setSelectedTodo(todo)
                      setShowEditDialog(true)
                    }}
                    className={`px-4 py-2 rounded text-white ${!todo.isCompleted
                      ? 'bg-blue-500 cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                      }`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTodoId(todo.id)
                      setShowDeleteDialog(true)
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

            {filteredTodos.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No todos found
              </div>
            )}

          </div>

          {/* Dialogs
            * This pattern is called "lifting state up". 
            * We lift the state of the delete dialog to the parent component (Todo) so that it can control when to show the dialog and which todo is being deleted. 
            * The DeleteConfirmationDialog component is a child component that receives props from the parent to determine its behavior.  
            * */}

          <AddTodoDialog
            isOpen={showAddDialog}
            onClose={closeAddDialog}
            onAdd={handleAddTodo}
          />

          <EditTodoDialog
            isOpen={showEditDialog}
            currentText={selectedTodo?.text ?? ''}
            onClose={closeEditDialog}
            onSave={handleSaveEdit}
          />

          <DeleteConfirmationDialog
            isOpen={showDeleteDialog}
            onClose={closeDeleteDialog}
            onConfirm={handleDelete}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

        </div>

      </div>
    </div>

  )
}

export default TodoOperations