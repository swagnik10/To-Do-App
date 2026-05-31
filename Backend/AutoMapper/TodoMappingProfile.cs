using AutoMapper;
using Backend.Domain;
using Backend.Dtos;

namespace Backend.AutoMapper;

public class TodoMappingProfile : Profile
{
    public TodoMappingProfile()
    {
        CreateMap<TodoItem, ToDoItemDto>();
        CreateMap<ToDoItemDto, TodoItem>();
    }
}
