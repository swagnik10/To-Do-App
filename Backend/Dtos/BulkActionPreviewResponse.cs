namespace Backend.Dtos;

public class BulkActionPreviewResponse
{
    public string Action { get; set; } = string.Empty;

    public int MatchCount { get; set; }

    public List<ToDoItemDto> MatchingTodos { get; set; } = [];
}
