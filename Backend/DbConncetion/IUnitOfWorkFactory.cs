namespace Backend.DbConncetion;

public interface IUnitOfWorkFactory
{
    IUnitOfWork Create();
}
