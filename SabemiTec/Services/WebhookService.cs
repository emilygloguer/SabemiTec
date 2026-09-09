using SabemiTec.Contracts;
using SabemiTec.Entities;
using SabemiTec.Persistence.Repositories;

namespace SabemiTec.Services;

public class WebhookService(ILogEventosBrutosRepositorio repositorio) : IWebhookService
{
    public async Task<LogEventoBrutoResponse> PersistirWebhook(PaymentWebhookRequest payload)
    {
        ArgumentNullException.ThrowIfNull(payload);

        LogEventosBrutos novoRegistro = payload.ConverterParaLogEventosBrutos();
        List<string> erros = ValidarPayload(payload);

        if (erros.Count > 0)
        {
            novoRegistro.StatusProcessamento = StatusProcessamento.Erro;
            novoRegistro.MensagemErro = string.Join(" ", erros);
        }

        LogEventosBrutos registroPersistido = await repositorio.PersistirAsync(novoRegistro);

        return registroPersistido.Resumo();
    }

    private static List<string> ValidarPayload(PaymentWebhookRequest payload)
    {
        List<string> erros = [];

        if (string.IsNullOrWhiteSpace(payload.IdTransacao))
            erros.Add("IdTransacao é obrigatório.");

        if (string.IsNullOrWhiteSpace(payload.IdContrato))
            erros.Add("IdContrato é obrigatório.");

        if (payload.Valor is null)
            erros.Add("Valor é obrigatório.");
        else if (payload.Valor <= 0)
            erros.Add("Valor deve ser maior que zero.");

        if (payload.DataPagamento is null)
            erros.Add("DataPagamento é obrigatória.");

        if (string.IsNullOrWhiteSpace(payload.Status))
            erros.Add("Status é obrigatório.");

        return erros;
    }
}
