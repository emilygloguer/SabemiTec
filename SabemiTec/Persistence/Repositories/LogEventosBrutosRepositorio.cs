using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SabemiTec.Entities;

namespace SabemiTec.Persistence.Repositories;

public class LogEventosBrutosRepositorio(
    AppDbContext dbContext) : ILogEventosBrutosRepositorio
{
    public async Task<LogEventosBrutos> PersistirAsync(
        LogEventosBrutos registro,
        CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(registro.TransacaoId))
        {
            bool transacaoExistente = await dbContext.LogsEventosBrutos
                    .AsNoTracking()
                    .AnyAsync(
                        log => log.TransacaoId == registro.TransacaoId,
                        cancellationToken);

            if (transacaoExistente)
                throw new InvalidOperationException(
                    $"Já existe um registro para a transação {registro.TransacaoId}.");
        }

        dbContext.LogsEventosBrutos.Add(registro);

        await dbContext.SaveChangesAsync(cancellationToken);
        return registro;
    }

    public async Task<IReadOnlyList<LogEventosBrutos>> ObterPendentesParaProcessamentoAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.LogsEventosBrutos
            .Where(log => log.StatusProcessamento == StatusProcessamento.Pendente)
            .OrderBy(log => log.DataRecebimento)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LogEventosBrutos>> ObterPagamentosAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.LogsEventosBrutos
            .AsNoTracking()
            .OrderByDescending(log => log.DataRecebimento)
            .ToListAsync(cancellationToken);
    }

    public async Task<StatusDoContrato?> ObterStatusDoContratoAsync(
        string contratoId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.StatusDosContratos
            .FirstOrDefaultAsync(
                status => status.ContratoId == contratoId,
                cancellationToken);
    }

    public async Task AtualizarProcessamentoEmLoteAsync(
        IReadOnlyList<LogEventosBrutos> registros,
        IReadOnlyList<StatusDoContrato> statusDosContratos,
        CancellationToken cancellationToken = default)
    {
        await using IDbContextTransaction transacao = await dbContext.Database
                .BeginTransactionAsync(cancellationToken);

        try
        {
            MarcarLogsParaAtualizacao(registros);
            AdicionarStatusDosContratosNovos(statusDosContratos);

            await dbContext.SaveChangesAsync(cancellationToken);
            await transacao.CommitAsync(cancellationToken);
        }
        catch
        {
            await transacao.RollbackAsync(
                CancellationToken.None);

            throw;
        }
    }

    private void MarcarLogsParaAtualizacao(
        IReadOnlyList<LogEventosBrutos> registros)
    {
        foreach (LogEventosBrutos registro in registros)
        {
            dbContext.Entry(registro)
                .Property(log => log.StatusProcessamento)
                .IsModified = true;

            dbContext.Entry(registro)
                .Property(log => log.MensagemErro)
                .IsModified = true;
        }
    }

    private void AdicionarStatusDosContratosNovos(
        IReadOnlyList<StatusDoContrato> statusDosContratos)
    {
        foreach (StatusDoContrato status in statusDosContratos)
        {
            if (dbContext.Entry(status).State == EntityState.Detached)
                dbContext.StatusDosContratos.Add(status);
        }
    }
}
