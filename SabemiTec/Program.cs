using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using SabemiTec.Background;
using SabemiTec.Filters;
using SabemiTec.Persistence;
using SabemiTec.Persistence.Repositories;
using SabemiTec.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<ILogEventosBrutosRepositorio, LogEventosBrutosRepositorio>();
builder.Services.AddScoped<IWebhookService, WebhookService>();
builder.Services.AddScoped<IWebhookProcessamentoService, WebhookProcessamentoService>();
builder.Services.AddHostedService<WebhookProcessamentoBackgroundService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        ApiKeyOperationFilter.SecuritySchemeName,
        new OpenApiSecurityScheme
        {
            Name = "X-Api-Key",
            Type = SecuritySchemeType.ApiKey,
            In = ParameterLocation.Header,
            Description = "Informe a API key usada pelo endpoint."
        });

    options.OperationFilter<ApiKeyOperationFilter>();
});

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "DefaultConnection não configurada");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

WebApplication app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    AppDbContext dbContext =
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
app.UseCors("Frontend");
app.MapControllers();

app.Run();
