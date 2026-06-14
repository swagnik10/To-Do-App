USE Todo;
GO

IF NOT EXISTS (
    SELECT 1
    FROM Todos.TodoItem
    WHERE TodoId = 'sedvyhhs-kjy'
)
BEGIN
    INSERT INTO Todos.TodoItem(TodoId, TodoTitle) VALUES('sedvyhhs-kjy', 'FirstTodo');
END