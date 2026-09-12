using SabemiTec.Contracts;

namespace SabemiTec.Services;

public interface IWebhookService
{
    Task<LogEventoBrutoResponse> PersistirWebhook(PaymentWebhookRequest payload);

    Task<IReadOnlyList<LogEventoBrutoResponse>>
        ObterPagamentosAsync(
            CancellationToken cancellationToken = default);

    Task<LogEventoBrutoResponse?> ObterPagamentoPorIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
