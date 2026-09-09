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

            StatusDoContrato statusDoContrato = registro.CriarStatusDoContrato();
            statusDosContratos[statusDoContrato.ContratoId] = statusDoContrato;
        }

        await repositorio.AtualizarProcessamentoEmLoteAsync(
            registrosPendentes,
            [.. statusDosContratos.Values],
            cancellationToken);
    }
}
