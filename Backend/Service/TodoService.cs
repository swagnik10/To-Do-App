using Backend.DbConncetion;
using Backend.Domain;
using Backend.Dtos;
using Backend.Repositories;

namespace Backend.Service;

public class TodoService : ITodoService
{
    private readonly ITodoRepository _repo;
    private readonly IUnitOfWorkFactory _uowFactory;

    public TodoService(ITodoRepository repo, IUnitOfWorkFactory uowFactory)
    {
        _repo = repo;
        _uowFactory = uowFactory;
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

    public async Task UpdateAsync(string todoid, UpdateToDoDto item)
    {
        using (var uow = _uowFactory.Create())
        {
            uow.BeginTransaction();

            var existing = await _repo.GetByIdForOpearion(todoid);
            if (existing == null)
                throw new Exception("Todo not found");

            existing.TodoTitle = item.TodoTitle ?? existing.TodoTitle;
            existing.IsCompleted = item.IsCompleted ?? existing.IsCompleted;

            await _repo.UpdateAsync(existing);

            await uow.CommitAsync();

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
}
