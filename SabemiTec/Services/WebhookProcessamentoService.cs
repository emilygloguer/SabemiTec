using SabemiTec.Entities;
using SabemiTec.Persistence.Repositories;

namespace SabemiTec.Services;

public class WebhookProcessamentoService(ILogEventosBrutosRepositorio repositorio) : IWebhookProcessamentoService
{
    private static readonly TimeSpan TempoSimuladoProcessamento = TimeSpan.FromSeconds(2);

    public async Task ProcessarPendentesAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<LogEventosBrutos> registrosPendentes =
            await repositorio.ObterPendentesParaProcessamentoAsync(cancellationToken);

        if (registrosPendentes.Count == 0)
            return;

        Dictionary<string, StatusDoContrato> statusDosContratos = [];

        foreach (LogEventosBrutos registro in registrosPendentes)
        {
            try
            {
                await Task.Delay(TempoSimuladoProcessamento, cancellationToken);

                registro.StatusProcessamento = StatusProcessamento.Sucesso;
                registro.MensagemErro = null;

                if (string.IsNullOrWhiteSpace(registro.ContratoId))
                    throw new InvalidOperationException("Contrato não informado.");

                StatusDoContrato? statusExistente = await repositorio.ObterStatusDoContratoAsync(
                    registro.ContratoId,
                    cancellationToken);

                StatusDoContrato statusContrato = registro.CriarOuAtualizarStatusDoContrato(statusExistente);

                statusDosContratos[statusContrato.ContratoId] = statusContrato;

            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                registro.StatusProcessamento = StatusProcessamento.Erro;
                registro.MensagemErro = ex.Message;
            }
        }

        await repositorio.AtualizarProcessamentoEmLoteAsync(
            registrosPendentes,
            [.. statusDosContratos.Values],
            cancellationToken);
    }
}
