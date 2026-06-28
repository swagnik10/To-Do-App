import { useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import { useDispatch, useSelector } from 'react-redux'

import { createTodoAsync, fetchTodosAsync, deleteTodoAsync, updateTodoAsync, toggleTodoAsync, type Todo } from '../features/todos/todoSlice'
import type { AppDispatch, RootState } from '../app/store'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import EditTodoDialog from './EditTodoDialog'
import AddTodoDialog from './AddToDoDialog'
import Pagination from './Pagination'
import todoBackground from '../../assets/todo-background.jpg'
import AiBulkActionDialog from './AiBulkActionDialog'

function TodoOperations() {

  const categories = [
    'Work',
    'Personal',
    'Health',
    'Shopping',
    'Urgent',
    'Other'
  ]

  const [searchText, setSearchText] = useState('')

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [showAiBulkDialog, setShowAiBulkDialog] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

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

      const matchesCategory =
        categoryFilter === 'all'
          ? true
          : todo.category === categoryFilter


      return matchesSearch && matchesFilter && matchesCategory
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

  const handleAddTodo = (inputText: string, category: string | null) => {
    if (!inputText.trim()) return

    dispatch(
      createTodoAsync({
        id: nanoid(),
        text: inputText.trim(),
        createdTime: new Date().toISOString(),
        isCompleted: false,
        category: category ?? 'Other'
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
  }, [searchText, filter, categoryFilter])

  useEffect(() => {
    dispatch(fetchTodosAsync())
  }, [dispatch])

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${todoBackground})`
      }}
    >
      <div className="min-h-screen bg-black/60">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

          {/* Header */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-8">
            Todo App
          </h1>

          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">

            <div className="space-y-4">

              {/* Top Row */}
              <div className="flex flex-col lg:flex-row gap-4">

                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search todos..."
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap justify-center gap-2">

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

              </div>

              {/* Bottom Row */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                {/* Category */}
                <div className="w-full md:w-64">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="all">
                      All Categories
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">

                  <button
                    onClick={() => setShowAiBulkDialog(true)}
                    className="w-full sm:w-auto bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    AI Bulk Action
                  </button>

                  <button
                    onClick={() => setShowAddDialog(true)}
                    className="w-full sm:w-auto bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    + Add Todo
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* Todo List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">

            {paginatedTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex flex-col lg:flex-row lg:items-center gap-4 px-4 sm:px-6 py-4 border-b last:border-b-0 hover:bg-gray-50"
              >

                {/* Todo */}
                <div className="flex items-center gap-3 flex-1">

                  <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={() => toggleTodo(todo)}
                    className="h-5 w-5"
                  />

                  <span
                    className={`flex-1 font-medium break-words ${todo.isCompleted
                      ? 'line-through text-gray-400'
                      : 'text-gray-800'
                      }`}
                  >
                    {todo.text}
                  </span>

                </div>

                {/* Category */}
                <div className="text-left lg:text-center lg:w-40 text-sm font-medium text-blue-600">
                  {todo.category ?? 'Other'}
                </div>

                {/* Date */}
                <div className="text-left lg:text-center lg:w-56 text-sm text-gray-500">
                  {new Date(todo.createdTime).toLocaleString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 lg:justify-end">

                  <button
                    disabled={todo.isCompleted}
                    onClick={() => {
                      setSelectedTodo(todo)
                      setShowEditDialog(true)
                    }}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded text-white ${!todo.isCompleted
                      ? 'bg-blue-500 hover:bg-blue-600'
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
                    className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
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

          <AiBulkActionDialog
            isOpen={showAiBulkDialog}
            onClose={() => setShowAiBulkDialog(false)}
            onExecuted={() => dispatch(fetchTodosAsync())}
          />

        </div>

      </div>
    </div>
  )
}

export default TodoOperations