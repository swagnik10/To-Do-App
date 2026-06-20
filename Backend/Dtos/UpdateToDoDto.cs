namespace Backend.Dtos;

public class UpdateToDoDto
{
    public virtual string? TodoTitle { get; set; }

    public virtual bool? IsCompleted { get; set; }

    public virtual string? Category { get; set; }
}
