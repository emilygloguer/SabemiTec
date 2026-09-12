using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SabemiTec.Filters;
using Xunit;

namespace SabemiTec.Tests;

public class ApiKeyAttributeTests
{
    [Fact]
    public async Task Deve_retornar_nao_autorizado_quando_a_api_key_nao_for_informada()
    {
        ApiKeyAttribute attribute = new();
        ActionExecutingContext context = CriarContexto("chave-esperada");

        await attribute.OnActionExecutionAsync(context, ProximaAcao);

        UnauthorizedObjectResult resultado = Assert.IsType<UnauthorizedObjectResult>(context.Result);
        Assert.Equal("API Key não informada.", ObterMensagem(resultado));
    }

    [Fact]
    public async Task Deve_retornar_nao_autorizado_quando_a_api_key_for_invalida()
    {
        ApiKeyAttribute attribute = new();
        ActionExecutingContext context = CriarContexto("chave-esperada", "chave-incorreta");

        await attribute.OnActionExecutionAsync(context, ProximaAcao);

        UnauthorizedObjectResult resultado = Assert.IsType<UnauthorizedObjectResult>(context.Result);
        Assert.Equal("API Key inválida.", ObterMensagem(resultado));
    }

    [Fact]
    public async Task Deve_executar_a_acao_quando_a_api_key_for_valida()
    {
        ApiKeyAttribute attribute = new();
        ActionExecutingContext context = CriarContexto("chave-esperada", "chave-esperada");
        bool acaoExecutada = false;

        await attribute.OnActionExecutionAsync(
            context,
            () =>
            {
                acaoExecutada = true;
                return ProximaAcao();
            });

        Assert.True(acaoExecutada);
        Assert.Null(context.Result);
    }

    private static ActionExecutingContext CriarContexto(string apiKeyEsperada, string? apiKeyInformada = null)
    {
        ServiceProvider serviceProvider = new ServiceCollection()
            .AddSingleton<IConfiguration>(new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ApiKey"] = apiKeyEsperada
                })
                .Build())
            .BuildServiceProvider();

        DefaultHttpContext httpContext = new()
        {
            RequestServices = serviceProvider
        };

        if (apiKeyInformada is not null)
        {
            httpContext.Request.Headers["X-Api-Key"] = apiKeyInformada;
        }

        ActionContext actionContext = new(
            httpContext,
            new RouteData(),
            new ActionDescriptor());

        return new ActionExecutingContext(
            actionContext,
            [],
            new Dictionary<string, object?>(),
            new object());
    }

    private static Task<ActionExecutedContext> ProximaAcao()
    {
        ActionContext actionContext = new(
            new DefaultHttpContext(),
            new RouteData(),
            new ActionDescriptor());

        return Task.FromResult(new ActionExecutedContext(actionContext, [], new object()));
    }

    private static string? ObterMensagem(UnauthorizedObjectResult resultado) =>
        resultado.Value?.GetType().GetProperty("message")?.GetValue(resultado.Value)?.ToString();
}
