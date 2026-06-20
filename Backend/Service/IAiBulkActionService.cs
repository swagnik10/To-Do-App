using Backend.Dtos;

namespace Backend.Service;

public interface IAiBulkActionService
{
    Task<AiBulkActionResponse> ParseAsync(string command);
}
