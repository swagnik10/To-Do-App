using Backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TodoController : ControllerBase
{
    private readonly ITodoRepository _todoRepository;
    public readonly ILogger<TodoController> _logger;

    public TodoController(ITodoRepository todoRepository, ILogger<TodoController> logger)
    {
        _todoRepository = todoRepository;
        _logger = logger;
    }
    [HttpGet]
    public IActionResult Get()
    {
        _logger.LogInformation("Received request to fetch todo items.");
        List<Domain.TodoItem> todos = _todoRepository.GetTodoItems();
        _logger.LogInformation("Fetched {Count} todo items.", todos.Count);
        return Ok(todos);
    }
}
