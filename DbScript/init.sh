#!/bin/sh

echo "Waiting for SQL Server..."

until /opt/mssql-tools/bin/sqlcmd \
  -S sqlserver \
  -U sa \
  -P "$SA_PASSWORD" \
  -Q "SELECT 1" > /dev/null 2>&1
do
  echo "SQL Server not ready..."
  sleep 5
done

echo "SQL Server ready."

/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -i /DbScript/01-create-database.sql

/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -d Todo -i /DbScript/02-create-schema.sql

/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -d Todo -i /DbScript/03-create-tables.sql

/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P "$SA_PASSWORD" -d Todo -i /DbScript/04-seed-data.sql

echo "Database initialization completed."