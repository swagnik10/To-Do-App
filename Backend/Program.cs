using Backend.AutoMapper;
using Backend.Configurations;
using Backend.DbConncetion;
using Backend.Repositories;
using Backend.Service;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy",
        policy =>
        {
            policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins("http://localhost:5173", "http://localhost:3000");
        });
});

builder.Services.AddHttpClient<IAiSuggestionService, AiSuggestionService>();

builder.Services.Configure<OllamaSettings>(
    builder.Configuration.GetSection("Ollama"));


// Dependency Injection
builder.Services.AddScoped<ITodoRepository, TodoRepository>();
builder.Services.AddScoped<IUnitOfWorkFactory, UnitOfWorkFactory>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITodoService, TodoService>();
//builder.Services.AddScoped<IAiSuggestionService, AiSuggestionService>();

builder.Services.AddScoped<NHibernate.ISession>(sp =>
{
    return NHibernateHelper.SessionFactory.OpenSession();
});

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<TodoMappingProfile>();
});

var app = builder.Build();

Log.Information("Application build scucessfully at {Time}", DateTime.Now);

// Swagger (Development only)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Configure the HTTP request pipeline.

//app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCors("ReactPolicy");

app.MapControllers();

// NHibernate configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
NHibernateHelper.Configure(connectionString);

Log.Information("Application starting running at {Time}", DateTime.Now);

app.Run();
