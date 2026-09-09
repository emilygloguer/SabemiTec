using SabemiTec.Contracts;
using SabemiTec.Entities;
using SabemiTec.Persistence.Repositories;

namespace SabemiTec.Services;

public class WebhookService(ILogEventosBrutosRepositorio repositorio) : IWebhookService
{
    public async Task<LogEventoBrutoResponse> PersistirWebhook(PaymentWebhookRequest payload)
    {
        ArgumentNullException.ThrowIfNull(payload);

        ValidarPayload(payload);

        LogEventosBrutos novoRegistro = payload.ConverterParaLogEventosBrutos();
        LogEventosBrutos registroPersistido = await repositorio.PersistirAsync(novoRegistro);

        return registroPersistido.Resumo();
    }

    private static void ValidarPayload(PaymentWebhookRequest payload)
    {
        List<string> camposAusentes = [];

        if (string.IsNullOrWhiteSpace(payload.IdTransacao))
            camposAusentes.Add(nameof(payload.IdTransacao));

        if (string.IsNullOrWhiteSpace(payload.IdContrato))
            camposAusentes.Add(nameof(payload.IdContrato));

        if (payload.DataPagamento == default)
            camposAusentes.Add(nameof(payload.DataPagamento));

        if (string.IsNullOrWhiteSpace(payload.Status))
            camposAusentes.Add(nameof(payload.Status));

        if (camposAusentes.Count > 0)
        {
            throw new ArgumentException(
                $"Payload inválido. Campos obrigatórios ausentes: {string.Join(", ", camposAusentes)}.",
                nameof(payload));
        }
    }
}
