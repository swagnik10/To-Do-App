namespace Backend.Dtos;

public class ToDoItemDto : UpdateToDoDto
{
    public virtual string TodoId { get; set; }
    public virtual DateTime CreatedAt { get; set; }
}
