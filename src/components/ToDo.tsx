import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useDispatch, useSelector } from 'react-redux'

import { addTodo } from '../features/todos/todoslice'
import type { RootState } from '../app/store'

function Todo() {
  const [text, setText] = useState('')

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
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="border rounded p-3"
          >
            <p className="font-medium">
              {todo.text}
            </p>

            <p className="text-sm text-gray-500">
              {new Date(todo.createdTime).toLocaleString()}
            </p>

            <p className="text-sm">
              Status:{' '}
              {todo.isCompleted
                ? 'Completed'
                : 'Pending'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Todo