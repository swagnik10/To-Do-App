import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createTodoApi, getTodosApi, deleteTodoApi, updateTodoApi, toggleTodoApi } from '../../api/todoApi'

export interface Todo {
  id: string
  text: string
  createdTime: string
  isCompleted: boolean
  category: string | null
}

export interface AiSuggestionResponse {
  suggestedTitle: string
  category: string
  success: boolean
  message: string | null
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
    const updatedTodo = await updateTodoApi(todo)

    return updatedTodo
  }
)

export const toggleTodoAsync = createAsyncThunk(
  'todo/toggleTodo',
  async (todo: Todo) => {
    const updatedTodo = await toggleTodoApi(todo)

    return updatedTodo
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
          createdTime: todo.createdAt,
          category: todo.category || 'Other'
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
        const index = state.todos.findIndex(
          t => t.id === action.payload.id
        );

        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      }
    )

    builder.addCase(
      toggleTodoAsync.fulfilled,
      (state, action) => {
        //console.log("Payload: ", action.payload);
        //console.log(JSON.parse(JSON.stringify(state.todos)));
        const index = state.todos.findIndex(
          t => t.id === action.payload.id
        );

        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      }
    )
  }

})

export default todoSlice.reducer