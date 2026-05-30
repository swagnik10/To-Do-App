import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Todo {
  id: string
  text: string
  createdTime: string
  isCompleted: boolean
}

interface TodoState {
  todos: Todo[]
}

const initialState: TodoState = {
  todos: []
}

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.todos.push(action.payload)
    },

    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter(
        todo => todo.id !== action.payload
      )
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(
        todo => todo.id === action.payload
      )
      if (todo) {
        todo.isCompleted = !todo.isCompleted
      }
    },
    updateTodo: (
      state,
      action: PayloadAction<{
        id: string
        text: string
      }>
    ) => {
      const todo = state.todos.find(
        todo => todo.id === action.payload.id
      )

      if (todo) {
        todo.text = action.payload.text
        todo.createdTime = new Date().toISOString()
      }
    }
  }
})

export const { addTodo, deleteTodo, toggleTodo, updateTodo } = todoSlice.actions

export default todoSlice.reducer