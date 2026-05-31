using Backend.Domain;

namespace Backend.Repositories;

public class TodoRepository : ITodoRepository
{
    private readonly NHibernate.ISession _session;
    private readonly ILogger<TodoRepository> _logger;

    public TodoRepository(NHibernate.ISession session, ILogger<TodoRepository> logger)
    {
        _session = session;
        _logger = logger;   
    }
    public List<TodoItem> GetTodoItems()
    {
        _logger.LogInformation("Fetching todo items from the database.");
        List<TodoItem> todoItems = _session.Query<TodoItem>().ToList();
        _logger.LogInformation("Fetching completed");
        return todoItems;
    }
}
