using Backend.Dtos;

namespace Backend.Service;

public interface ITodoService
{
    Task<List<ToDoItemDto>> GetAllAsync();
    Task<ToDoItemDto> RetrieveByIdAsync(string todoid);
    Task CreateAsync(ToDoItemDto item);
    Task<ToDoItemDto> UpdateAsync(string todoid, UpdateToDoDto item);
    Task DeleteAsync(string todoid);
    Task<BulkActionPreviewResponse> PreviewBulkActionAsync(AiBulkActionResponse action);
    Task<int> ExecuteBulkActionAsync(AiBulkActionResponse action);
}
