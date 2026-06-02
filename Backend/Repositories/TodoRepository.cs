using AutoMapper;
using Backend.Domain;
using Backend.Dtos;
using NHibernate.Linq;

namespace Backend.Repositories;

public class TodoRepository : ITodoRepository
{
    private readonly NHibernate.ISession _session;
    private readonly ILogger<TodoRepository> _logger;
    private readonly IMapper _mapper;

    public TodoRepository(NHibernate.ISession session, ILogger<TodoRepository> logger, IMapper mapper)
    {
        _session = session;
        _logger = logger;
        _mapper = mapper;
    }
    public async Task<List<ToDoItemDto>> GetTodoItemsAsync()
    {
        try
        {
            _logger.LogInformation("Fetching todo items from the database.");
            List<TodoItem> todoItems = await _session.Query<TodoItem>().ToListAsync();
            _logger.LogInformation("Fetching completed");
            return _mapper.Map<List<ToDoItemDto>>(todoItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database error");

            Console.WriteLine(ex.ToString());

            if (ex.InnerException != null)
            {
                Console.WriteLine("INNER:");
                Console.WriteLine(ex.InnerException.ToString());
            }

            throw;
        }
    }
    public async Task<ToDoItemDto> GetByIdAsync(string todoid)
    {
        try
        {
            var todoItem = await _session.Query<TodoItem>().FirstOrDefaultAsync(t => t.TodoId == todoid);
            return _mapper.Map<ToDoItemDto>(todoItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database error");

            Console.WriteLine(ex.ToString());

            if (ex.InnerException != null)
            {
                Console.WriteLine("INNER:");
                Console.WriteLine(ex.InnerException.ToString());
            }

            throw;
        }
    }

    public async Task<TodoItem> GetByIdForOpearion(string todoid)
    {
        return await _session.Query<TodoItem>().FirstOrDefaultAsync(t => t.TodoId == todoid);    
    }

    public async Task AddAsync(ToDoItemDto item)
    {
        try
        {
            TodoItem todoItem = _mapper.Map<TodoItem>(item);
            await _session.SaveAsync(todoItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database error");

            Console.WriteLine(ex.ToString());

            if (ex.InnerException != null)
            {
                Console.WriteLine("INNER:");
                Console.WriteLine(ex.InnerException.ToString());
            }

            throw;
        }
    }

    public async Task<ToDoItemDto> UpdateAsync(TodoItem item)
    {
        try
        {
            item.CreatedAt = DateTime.Now;
            await _session.UpdateAsync(item);
            return _mapper.Map<ToDoItemDto>(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database error");

            Console.WriteLine(ex.ToString());

            if (ex.InnerException != null)
            {
                Console.WriteLine("INNER:");
                Console.WriteLine(ex.InnerException.ToString());
            }

            throw;
        }
    }

    public async Task DeleteAsync(TodoItem item)
    {
        try
        {
            await _session.DeleteAsync(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database error");

            Console.WriteLine(ex.ToString());

            if (ex.InnerException != null)
            {
                Console.WriteLine("INNER:");
                Console.WriteLine(ex.InnerException.ToString());
            }

            throw;
        }
    }
}
