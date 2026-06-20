namespace Backend.Dtos;

public class AiSuggestionResponse
{
    public string SuggestedTitle { get; set; } = string.Empty;

    public string Category { get; set; } = "Other";
}