using Backend.Domain;
using Backend.Dtos;

namespace Backend.Repositories;

public interface ITodoRepository
{
    Task<List<ToDoItemDto>> GetTodoItemsAsync();
    Task<ToDoItemDto> GetByIdAsync(string todoid);
    Task AddAsync(ToDoItemDto item);
    Task<ToDoItemDto> UpdateAsync(TodoItem item);
    Task DeleteAsync(TodoItem item);
    Task<TodoItem> GetByIdForOpearion(string todoid);
}
