namespace Backend.Dtos;

public class AiBulkActionResponse
{
    public string Action { get; set; } = string.Empty;

    public string? Category { get; set; }

    public bool? IsCompleted { get; set; }

    public bool Success { get; set; }

    public string? Message { get; set; }
}
