using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SabemiTec.Filters;

public class ApiKeyAttribute : Attribute, IAsyncActionFilter
{
    private const string ApiKeyHeaderName = "X-Api-Key";

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        IConfiguration configuration = context.HttpContext.RequestServices
            .GetRequiredService<IConfiguration>();

        string? expectedApiKey = configuration["ApiKey"];

        if (!context.HttpContext.Request.Headers.TryGetValue(
                ApiKeyHeaderName,
                out var providedApiKey))
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                message = "API Key não informada."
            });

            return;
        }

        if (string.IsNullOrWhiteSpace(expectedApiKey) ||
            providedApiKey != expectedApiKey)
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                message = "API Key inválida."
            });

            return;
        }

        await next();
    }
}
