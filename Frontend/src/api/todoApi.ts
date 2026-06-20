import axios from 'axios'
import type { Todo } from '../features/todos/todoSlice'
import { API_BASE_URL } from './apiConfig'

const api = axios.create({
  baseURL: API_BASE_URL
})

export const createTodoApi = async (todo: Todo) => {
  const response = await api.post('', {
    todoId: todo.id,
    todoTitle: todo.text,
    isCompleted: todo.isCompleted,
    createdAt: todo.createdTime,
    category: todo.category
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
    todoTitle: todo.text,
    category: todo.category
  })

  return {
    id: response.data.todoId,
    text: response.data.todoTitle,
    isCompleted: response.data.isCompleted,
    createdTime: response.data.createdAt,
    category: response.data.category || 'Other'
  };
}

export const toggleTodoApi = async (todo: Todo) => {
  const response = await api.put(`/${todo.id}`, {
    isCompleted: todo.isCompleted
  })

  return {
    id: response.data.todoId,
    text: response.data.todoTitle,
    isCompleted: response.data.isCompleted,
    createdTime: response.data.createdAt,
    category: response.data.category || 'Other'
  };
}

export const getAiSuggestionApi = async (
  todoTitle: string
) => {
  const response = await api.post('/suggest', {
    todoTitle
  })

  return response.data
}


export default api