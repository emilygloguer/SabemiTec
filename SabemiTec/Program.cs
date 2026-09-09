using Microsoft.EntityFrameworkCore;
using SabemiTec.Persistence;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "DefaultConnection não configurada");

var connectionBuilder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);

Console.WriteLine($"Host: {connectionBuilder.Host}");
Console.WriteLine($"Port: {connectionBuilder.Port}");
Console.WriteLine($"Database: {connectionBuilder.Database}");
Console.WriteLine($"Username: {connectionBuilder.Username}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

WebApplication app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext =
        scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        await dbContext.Database.OpenConnectionAsync();

        Console.WriteLine("PostgreSQL conectado: True");

        await dbContext.Database.CloseConnectionAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine("PostgreSQL conectado: False");
        Console.WriteLine(ex.Message);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "Sabemi Webhooks API v1");
    });
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
