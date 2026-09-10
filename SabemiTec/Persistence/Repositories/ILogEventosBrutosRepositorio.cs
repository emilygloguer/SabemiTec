using SabemiTec.Entities;

namespace SabemiTec.Persistence.Repositories;

public interface ILogEventosBrutosRepositorio
{
    Task<LogEventosBrutos> PersistirAsync(
        LogEventosBrutos registro,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogEventosBrutos>>
        ObterPendentesParaProcessamentoAsync(
            CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogEventosBrutos>>
        ObterPagamentosAsync(
            CancellationToken cancellationToken = default);

    Task<StatusDoContrato?> ObterStatusDoContratoAsync(
        string contratoId,
        CancellationToken cancellationToken = default);

    Task AtualizarProcessamentoEmLoteAsync(
        IReadOnlyList<LogEventosBrutos> registros,
        IReadOnlyList<StatusDoContrato> statusDosContratos,
        CancellationToken cancellationToken = default);
}
