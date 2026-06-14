USE Todo;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'TodoItem'
      AND s.name = 'Todos'
)
BEGIN
    CREATE TABLE Todos.TodoItem
    (
        Id INT IDENTITY(1,1) NOT NULL,
        TodoId VARCHAR(200) NOT NULL,
        TodoTitle VARCHAR(200) NOT NULL,
        IsCompleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE()

        CONSTRAINT PK_TodoItem
            PRIMARY KEY (Id, TodoId)
    );
END
GO