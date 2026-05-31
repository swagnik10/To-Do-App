using Backend.Domain;
using Backend.Dtos;

namespace Backend.Service;

public interface ITodoService
{
    Task<List<ToDoItemDto>> GetAllAsync();
    Task<ToDoItemDto> RetrieveByIdAsync(string todoid);
    Task CreateAsync(ToDoItemDto item);
    Task UpdateAsync(string todoid, ToDoItemDto item);
    Task DeleteAsync(string todoid);
}
