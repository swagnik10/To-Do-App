namespace Backend.Dtos;

public class ToDoItemDto
{
    public virtual string TodoId { get; set; }

    public virtual string TodoTitle { get; set; }

    public virtual bool IsCompleted { get; set; }

    public virtual DateTime CreatedAt { get; set; }
}
