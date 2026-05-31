namespace Backend.DbConncetion;

public interface IUnitOfWork : IDisposable
{
    NHibernate.ISession Session { get; }
    void  BeginTransaction();
    Task CommitAsync();
    Task RollbackAsync();
}

