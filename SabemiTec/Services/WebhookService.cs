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
        List<string> erros = ValidarPayload(novoRegistro);

        if (erros.Count > 0)
        {
            novoRegistro.StatusProcessamento = StatusProcessamento.Erro;
            novoRegistro.MensagemErro = string.Join(" ", erros);
        }

        LogEventosBrutos registroPersistido = await repositorio.PersistirAsync(novoRegistro);

        return registroPersistido.Resumo();
    }

    public async Task<IReadOnlyList<LogEventoBrutoResponse>> ObterPagamentosAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<LogEventosBrutos> registros =
            await repositorio.ObterPagamentosAsync(cancellationToken);

        return [.. registros.Select(registro => registro.Resumo())];
    }

    private static List<string> ValidarPayload(LogEventosBrutos registro)
    {
        List<string> erros = [];

        if (string.IsNullOrWhiteSpace(registro.TransacaoId))
            erros.Add("IdTransacao é obrigatório.");

        if (string.IsNullOrWhiteSpace(registro.ContratoId))
            erros.Add("IdContrato é obrigatório.");

        if (registro.Valor <= 0)
            erros.Add("Valor deve ser maior que zero.");

        if (registro.DataPagamento == DateTime.MinValue)
            erros.Add("DataPagamento é obrigatória.");

        if (string.IsNullOrWhiteSpace(registro.StatusRecebido))
            erros.Add("Status é obrigatório.");

        return erros;
    }

}
