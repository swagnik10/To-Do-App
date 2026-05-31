using NHibernate;

namespace Backend.DbConncetion;

public class UnitOfWork : IUnitOfWork
{
    private readonly NHibernate.ISession _session;
    private ITransaction? _transaction;

    public NHibernate.ISession Session => _session;

    public UnitOfWork(NHibernate.ISession session)
    {
        _session = session;
    }

    public void  BeginTransaction()
    {
        if (_transaction == null || !_transaction.IsActive)
        {
            _transaction = _session.BeginTransaction();
        }
    }

    public async Task CommitAsync()
    {
        try
        {
            if (_transaction != null && _transaction.IsActive)
            {
                await _transaction.CommitAsync();
            }
        }
        catch
        {
            await RollbackAsync();
            throw;
        }
        finally
        {
            _transaction?.Dispose();
            _transaction = null;
        }
    }

    public async Task RollbackAsync()
    {
        try
        {
            if (_transaction != null && _transaction.IsActive)
            {
               await  _transaction.RollbackAsync();
            }
        }
        finally
        {
            _transaction?.Dispose();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        if (_transaction != null && _transaction.IsActive)
        {
            _transaction.Dispose();
        }

        _session.Dispose();
    }
}
