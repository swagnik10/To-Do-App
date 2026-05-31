using Backend.Domain;
using FluentNHibernate.Mapping;

namespace Backend.Mappings;

public class TodoItemMap : ClassMap<TodoItem>
{
    public TodoItemMap()
    {
        Schema("Todos");

        Table("TodoItem");

        Id(x => x.Id)
            .Column("Id")
            .GeneratedBy.Identity();

        Map(x => x.TodoId)
            .Column("TodoId")
            .Length(200)
            .Not.Nullable();

        Map(x => x.TodoTitle)
            .Column("TodoTitle")
            .Length(200)
            .Not.Nullable();

        Map(x => x.IsCompleted)
            .Column("IsCompleted")
            .Not.Nullable();

        Map(x => x.CreatedAt)
            .Column("CreatedAt")
            .Not.Nullable();
    }
}







