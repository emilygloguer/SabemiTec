using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SabemiTec.Filters;

public sealed class ApiKeyOperationFilter : IOperationFilter
{
    public const string SecuritySchemeName = "ApiKey";

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        bool exigeApiKey = context.MethodInfo.IsDefined(typeof(ApiKeyAttribute), inherit: true)
            || context.MethodInfo.DeclaringType?.IsDefined(typeof(ApiKeyAttribute), inherit: true) == true;

        if (!exigeApiKey)
        {
            return;
        }

        operation.Security ??= [];
        operation.Security.Add(new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference(SecuritySchemeName, context.Document)] = []
        });
    }
}
