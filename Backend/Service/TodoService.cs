using AutoMapper;
using Backend.DbConncetion;
using Backend.Dtos;
using Backend.Repositories;

namespace Backend.Service;

public class TodoService : ITodoService
{
    private readonly ITodoRepository _repo;
    private readonly IUnitOfWorkFactory _uowFactory;
    private readonly IMapper _mapper;

    public TodoService(ITodoRepository repo, IUnitOfWorkFactory uowFactory, IMapper mapper)
    {
        _repo = repo;
        _uowFactory = uowFactory;
        _mapper = mapper;
    }

    public async Task<List<ToDoItemDto>> GetAllAsync()
    {
        return await _repo.GetTodoItemsAsync();
    }

    public async Task<ToDoItemDto> RetrieveByIdAsync(string todoid)
    {
        return await _repo.GetByIdAsync(todoid);
    }

    public async Task CreateAsync(ToDoItemDto item)
    {
        using (var uow = _uowFactory.Create())
        {
            uow.BeginTransaction();

            await _repo.AddAsync(item);

            await uow.CommitAsync();
        }
        
    }

    public async Task<ToDoItemDto> UpdateAsync(string todoid, UpdateToDoDto item)
    {
        using (var uow = _uowFactory.Create())
        {
            uow.BeginTransaction();

            var existing = await _repo.GetByIdForOpearion(todoid);
            if (existing == null)
                throw new Exception("Todo not found");

            existing.TodoTitle = item.TodoTitle ?? existing.TodoTitle;
            existing.IsCompleted = item.IsCompleted ?? existing.IsCompleted;
            existing.Category = item.Category ?? existing.Category;

            var todoItem = await _repo.UpdateAsync(existing);

            await uow.CommitAsync();

            return todoItem;

        }

    }

    public async Task DeleteAsync(string todoid)
    {
        using (var uow = _uowFactory.Create())
        {
            uow.BeginTransaction();

            var existing = await _repo.GetByIdForOpearion(todoid);
            if (existing != null)
            {
                await _repo.DeleteAsync(existing);
            }

            await uow.CommitAsync();

        }

    }

    public async Task<BulkActionPreviewResponse> PreviewBulkActionAsync(
    AiBulkActionResponse action)
    {
        var matchingTodos =
            await _repo.FindMatchingTodosAsync(
                action.Category,
                GetCompletionFilter(action.Action));

        return new BulkActionPreviewResponse
        {
            Action = action.Action,
            MatchCount = matchingTodos.Count,
            MatchingTodos =
                _mapper.Map<List<ToDoItemDto>>(matchingTodos)
        };
    }

    public async Task<int> ExecuteBulkActionAsync(AiBulkActionResponse action)
    {
        if (action.Action.Equals("select", StringComparison.OrdinalIgnoreCase))
        {
            return 0;
        }

        using (var uow = _uowFactory.Create())
        {
            uow.BeginTransaction();

            var matchingTodos =
                await _repo.FindMatchingTodosAsync(
                    action.Category,
                    GetCompletionFilter(action.Action));

            if (action.Action.Equals("complete", StringComparison.OrdinalIgnoreCase))
            {
                foreach (var todo in matchingTodos)
                {
                    todo.IsCompleted = true;

                    await _repo.UpdateAsync(todo);
                }
            }
            else if (action.Action.Equals("uncomplete", StringComparison.OrdinalIgnoreCase))
            {
                foreach (var todo in matchingTodos)
                {
                    todo.IsCompleted = false;

                    await _repo.UpdateAsync(todo);
                }
            }
            else if (action.Action.Equals("delete", StringComparison.OrdinalIgnoreCase))
            {
                foreach (var todo in matchingTodos)
                {
                    await _repo.DeleteAsync(todo);
                }
            }

            await uow.CommitAsync();

            return matchingTodos.Count;
        }
    }

    private static bool? GetCompletionFilter(string action)
    {
        if (action.Equals("complete", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (action.Equals("uncomplete", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return null;
    }
}
