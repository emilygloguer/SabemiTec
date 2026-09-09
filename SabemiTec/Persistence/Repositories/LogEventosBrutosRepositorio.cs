using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SabemiTec.Entities;

namespace SabemiTec.Persistence.Repositories;

public class LogEventosBrutosRepositorio(AppDbContext dbContext) : ILogEventosBrutosRepositorio
{
    public async Task<LogEventosBrutos> PersistirAsync(
        LogEventosBrutos registro,
        CancellationToken cancellationToken = default)
    {
        LogEventosBrutos? registroExistente = await dbContext.LogsEventosBrutos
            .AsNoTracking()
            .FirstOrDefaultAsync(
                log => log.TransacaoId == registro.TransacaoId,
                cancellationToken);

        if (registroExistente is not null)
            throw new InvalidOperationException(
                $"Já existe um registro para a transação {registro.TransacaoId}.");

        dbContext.LogsEventosBrutos.Add(registro);
        await dbContext.SaveChangesAsync(cancellationToken);

        return registro;
    }

    public async Task<IReadOnlyList<LogEventosBrutos>> ObterPendentesParaProcessamentoAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.LogsEventosBrutos
            .Include(log => log.StatusDoContrato)
            .Where(log => log.StatusProcessamento == StatusProcessamento.Pendente)
            .OrderBy(log => log.DataRecebimento)
            .ToListAsync(cancellationToken);
    }

    public async Task AtualizarProcessamentoEmLoteAsync(
        IReadOnlyList<LogEventosBrutos> registros,
        IReadOnlyList<StatusDoContrato> statusDosContratos,
        CancellationToken cancellationToken = default)
    {
        await using IDbContextTransaction transacao =
            await dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            MarcarLogsParaAtualizacao(registros);
            AdicionarStatusDosContratosNovos(statusDosContratos);

            await dbContext.SaveChangesAsync(cancellationToken);
            await transacao.CommitAsync(cancellationToken);
        }
        catch
        {
            await transacao.RollbackAsync(CancellationToken.None);
            throw;
        }
    }

    private void MarcarLogsParaAtualizacao(IReadOnlyList<LogEventosBrutos> registros)
    {
        foreach (LogEventosBrutos registro in registros)
        {
            dbContext.Entry(registro).Property(log => log.StatusProcessamento).IsModified = true;
            dbContext.Entry(registro).Property(log => log.MensagemErro).IsModified = true;
        }
    }

    private void AdicionarStatusDosContratosNovos(IReadOnlyList<StatusDoContrato> statusDosContratos)
    {
        foreach (StatusDoContrato statusDoContrato in statusDosContratos)
        {
            if (dbContext.Entry(statusDoContrato).State == EntityState.Detached)
                dbContext.StatusDosContratos.Add(statusDoContrato);
        }
    }
}
