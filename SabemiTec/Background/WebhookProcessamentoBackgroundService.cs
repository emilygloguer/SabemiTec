using SabemiTec.Services;

namespace SabemiTec.Background;

public class WebhookProcessamentoBackgroundService(
    IServiceScopeFactory serviceScopeFactory,
    ILogger<WebhookProcessamentoBackgroundService> logger) : BackgroundService
{
    private static readonly TimeSpan IntervaloProcessamento = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ProcessarPendentesAsync(stoppingToken);

            try
            {
                await Task.Delay(IntervaloProcessamento, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task ProcessarPendentesAsync(CancellationToken stoppingToken)
    {
        try
        {
            await using AsyncServiceScope scope = serviceScopeFactory.CreateAsyncScope();

            IWebhookProcessamentoService processamentoService =
                scope.ServiceProvider.GetRequiredService<IWebhookProcessamentoService>();

            await processamentoService.ProcessarPendentesAsync(stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao processar os webhooks pendentes.");
        }
    }
}
