using FluentNHibernate.Cfg.Db;
using FluentNHibernate.Cfg;
using NHibernate.Driver;
using NHibernate;
using Backend.Domain;

namespace Backend.DbConncetion;

public static class NHibernateHelper
{
    private static ISessionFactory? _sessionFactory;
    private static string? _connectionString;

    public static void Configure(string connectionString)
    {
        _connectionString = connectionString;
    }

    public static ISessionFactory SessionFactory
    {
        get
        {
            if (_sessionFactory == null)
            {
                _sessionFactory = Fluently.Configure()
                                        .Database(
                                            PostgreSQLConfiguration.Standard
                                                .ConnectionString(_connectionString)
                                                .ShowSql()
                                        )
                                        .Mappings(m =>
                                            m.FluentMappings
                                                .AddFromAssemblyOf<TodoItem>()
                                        )
                                        .BuildSessionFactory();
            }

            return _sessionFactory;
        }
    }
}

