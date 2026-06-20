using Backend.Dtos;

namespace Backend.Service;

public interface IAiSuggestionService
{
    Task<AiSuggestionResponse> SuggestAsync(string title);
}
