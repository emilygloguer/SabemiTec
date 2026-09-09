namespace SabemiTec.Services;

public interface IWebhookProcessamentoService
{
    Task ProcessarPendentesAsync(CancellationToken cancellationToken = default);
}
