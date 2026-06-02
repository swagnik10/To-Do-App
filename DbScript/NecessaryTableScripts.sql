create database Todo;

 Use Todo;

create schema Todos;

CREATE TABLE Todos.TodoItem
(
    Id INT IDENTITY(1,1) NOT NULL,
    TodoId VARCHAR(200) NOT NULL,
    TodoTitle VARCHAR(200) NOT NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT PK_TodoItem
        PRIMARY KEY (Id, TodoId)
);

insert into Todos.TodoItem(TodoId, TodoTitle) values('sedvyhhs-kjy','FirstTodo');

select * from Todos.TodoItem;

