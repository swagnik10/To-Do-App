import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createTodoApi, getTodosApi, deleteTodoApi, updateTodoApi, toggleTodoApi } from '../../api/todoApi'

export interface Todo {
  id: string
  text: string
  createdTime: string
  isCompleted: boolean
}

interface TodoState {
  todos: Todo[]
  loading: boolean
}

const initialState: TodoState = {
  todos: [],
  loading: false
}

export const createTodoAsync = createAsyncThunk(
  'todo/createTodo',
  async (todo: Todo) => {
    await createTodoApi(todo)

    return todo
  }
)

export const fetchTodosAsync = createAsyncThunk(
  'todo/fetchTodos',
  async () => {
    return await getTodosApi()
  }
)

export const deleteTodoAsync = createAsyncThunk(
  'todo/deleteTodo',
  async (todoId: string) => {
    await deleteTodoApi(todoId)

    return todoId
  }
)

export const updateTodoAsync = createAsyncThunk(
  'todo/updateTodo',
  async (todo: Todo) => {
    await updateTodoApi(todo)

    return todo
  }
)

export const toggleTodoAsync = createAsyncThunk(
  'todo/toggleTodo',
  async (todo: Todo) => {
    await toggleTodoApi(todo)

    return todo
  }
)

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(
      createTodoAsync.fulfilled,
      (state, action) => {
        state.todos.push(action.payload)
      }
    )

    builder.addCase(
      fetchTodosAsync.pending,
      state => {
        state.loading = true
      }
    )
    builder.addCase(
      fetchTodosAsync.fulfilled,
      (state, action) => {

        state.loading = false

        state.todos = action.payload.map((todo: any) => ({
          id: todo.todoId,
          text: todo.todoTitle,
          isCompleted: todo.isCompleted,
          createdTime: todo.createdAt
        }))
      }
    )
    builder.addCase(
      fetchTodosAsync.rejected,
      state => {
        state.loading = false
      }
    )
    builder.addCase(
      deleteTodoAsync.fulfilled,
      (state, action) => {
        state.todos = state.todos.filter(
          todo => todo.id !== action.payload
        )
      }
    )

    builder.addCase(
      updateTodoAsync.fulfilled,
      (state, action) => {
        const todo = state.todos.find(
          t => t.id === action.payload.id
        )

        if (todo) {
          todo.text = action.payload.text
        }
      }
    )

    builder.addCase(
      toggleTodoAsync.fulfilled,
      (state, action) => {
        const todo = state.todos.find(
          t => t.id === action.payload.id
        )

        if (todo) {
          todo.isCompleted = action.payload.isCompleted
        }
      }
    )
  }

})

//export const { toggleTodo } = todoSlice.actions

export default todoSlice.reducer