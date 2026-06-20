namespace Backend.Dtos;

public class AiSuggestionResponse
{
    public string SuggestedTitle { get; set; } = string.Empty;

    public string Category { get; set; } = "Other";

    public bool Success { get; set; }

    public string? Message { get; set; }
}