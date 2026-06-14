USE Todo;
GO

IF NOT EXISTS (
    SELECT *
    FROM sys.schemas
    WHERE name = 'Todos'
)
BEGIN
    EXEC('CREATE SCHEMA Todos');
END
GO