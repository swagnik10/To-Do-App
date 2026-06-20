using Backend.Domain;
using Backend.Dtos;
using Backend.Service;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TodoController : ControllerBase
{
    public readonly ILogger<TodoController> _logger;
    private readonly ITodoService _todoService;
    private readonly IAiSuggestionService _aiSuggestionService;
    private readonly IAiBulkActionService _aiBulkActionService;

    public TodoController(ILogger<TodoController> logger, 
        ITodoService todoService, 
        IAiSuggestionService aiSuggestionService,
        IAiBulkActionService aiBulkActionService)
    {
        _logger = logger;
        _todoService = todoService;
        _aiSuggestionService = aiSuggestionService;
        _aiBulkActionService = aiBulkActionService;
    }
    // =========================
    // GET: api/todo
    // =========================
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("Fetching all todos");

        try
        {
            var todos = await _todoService.GetAllAsync();

            return Ok(todos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating the todo: {ex.Message}");
        }
    }

    // =========================
    // GET: api/todo/{todoid}
    // =========================
    [HttpGet("{todoid}")]
    public async Task<IActionResult> GetById(string todoid)
    {
        _logger.LogInformation("Fetching todo with id {Id}", todoid);

        try
        {
            var todo = await _todoService.RetrieveByIdAsync(todoid);

            if (todo == null)
            {
                _logger.LogWarning("Todo with id {Id} not found", todoid);
                return NotFound($"Todo with id {todoid} not found");
            }

            return Ok(todo);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating the todo: {ex.Message}");
        }
    }


    // =========================
    // POST: api/todo
    // =========================
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ToDoItemDto todo)
    {
        if (todo == null)
        {
            return BadRequest("Invalid todo data");
        }

        _logger.LogInformation("Creating new todo");

        try
        {
            await _todoService.CreateAsync(todo);
            return Ok("Sucessfully Todo Aded");

        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating the todo: {ex.Message}");
        }
    }

    // =========================
    // PUT: api/todo/{id}
    // =========================
    [HttpPut("{todoid}")]
    public async Task<IActionResult> Update(string todoid, [FromBody] UpdateToDoDto todo)
    {
        if (todo == null)
        {
            return BadRequest("Invalid todo data");
        }

        try
        {
            _logger.LogInformation("Updating todo with id {Id}", todoid);

            var existing = await _todoService.RetrieveByIdAsync(todoid);

            if (existing == null)
            {
                _logger.LogWarning("Todo with id {Id} not found for update", todoid);
                return NotFound();
            }

            var todoItem = await _todoService.UpdateAsync(todoid, todo);
            return Ok(todoItem);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating the todo: {ex.Message}");
        }

    }

    // =========================
    // DELETE: api/todo/{id}
    // =========================
    [HttpDelete("{todoid}")]
    public async Task<IActionResult> Delete(string todoid)
    {
        _logger.LogInformation("Deleting todo with id {Id}", todoid);

        try
        {
            var existing = await _todoService.RetrieveByIdAsync(todoid);

            if (existing == null)
            {
                _logger.LogWarning("Todo with id {Id} not found for delete", todoid);
                return NotFound();
            }

            await _todoService.DeleteAsync(todoid);
            return Ok("Sucessfully Todo Deleted");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating the todo: {ex.Message}");
        }
    }


    [HttpPost("suggest")]
    public async Task<IActionResult> Suggest([FromBody] AiSuggestionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TodoTitle))
            return BadRequest();

        var response = await _aiSuggestionService.SuggestAsync(request.TodoTitle);

        return Ok(response);
    }

    [HttpPost("bulk/preview")]
    public async Task<IActionResult> PreviewBulkAction([FromBody] AiBulkActionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Command))
        {
            return BadRequest();
        }

        var parsedAction = await _aiBulkActionService.ParseAsync(request.Command);

        if (!parsedAction.Success)
        {
            return BadRequest(parsedAction);
        }

        var preview = await _todoService.PreviewBulkActionAsync(parsedAction);

        return Ok(preview);
    }

    [HttpPost("bulk/execute")]
    public async Task<IActionResult> ExecuteBulkAction([FromBody] AiBulkActionResponse action)
    {
        var affectedCount = await _todoService.ExecuteBulkActionAsync(action);

        return Ok(new
        {
            affectedCount
        });
    }
}
