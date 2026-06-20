namespace Backend.Domain;

public class TodoItem
{
    public virtual int Id { get; set; }

    public virtual string TodoId { get; set; }

    public virtual string TodoTitle { get; set; }

    public virtual bool IsCompleted { get; set; }

    public virtual DateTime CreatedAt { get; set; }

    public virtual string? Category { get; set; }
}
