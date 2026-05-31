using Backend.Domain;

namespace Backend.Repositories;

public interface ITodoRepository
{
    List<TodoItem> GetTodoItems();
}
