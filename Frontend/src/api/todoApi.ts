import axios from 'axios'
import type { Todo } from '../features/todos/todoSlice'

const api = axios.create({
  baseURL: 'https://localhost:7258/api/todo'
})

export const createTodoApi = async (todo: Todo) => {
  const response = await api.post('', {
    todoId: todo.id,
    todoTitle: todo.text,
    isCompleted: todo.isCompleted,
    createdAt: todo.createdTime
  })

  return response.data
}

export const getTodosApi = async () => {
  const response = await api.get('/')

  return response.data
}

export const deleteTodoApi = async (todoId: string) => {
  const response = await api.delete(`/${todoId}`)

  return response.data
}

export const updateTodoApi = async (todo: Todo) => {
  const response = await api.put(`/${todo.id}`, {
    todoTitle: todo.text
  })

  return response.data
}

export const toggleTodoApi = async (todo: Todo) => {
  const response = await api.put(`/${todo.id}`, {
    isCompleted: todo.isCompleted
  })

  return response.data
}

export default api