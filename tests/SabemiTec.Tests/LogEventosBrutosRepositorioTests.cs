using Microsoft.EntityFrameworkCore;
using SabemiTec.Entities;
using SabemiTec.Persistence;
using SabemiTec.Persistence.Repositories;
using Xunit;

namespace SabemiTec.Tests;

public class LogEventosBrutosRepositorioTests
{
    [Fact]
    public async Task ObterPagamentosAsync_deve_ordenar_pelos_recebimentos_mais_recentes()
    {
        await using AppDbContext dbContext = CriarDbContext();

        LogEventosBrutos registroAntigo = CriarRegistro(
            "transacao-antiga",
            new DateTime(2026, 9, 10, 10, 0, 0, DateTimeKind.Utc));
        LogEventosBrutos registroRecente = CriarRegistro(
            "transacao-recente",
            new DateTime(2026, 9, 10, 11, 0, 0, DateTimeKind.Utc));

        dbContext.LogsEventosBrutos.AddRange(registroAntigo, registroRecente);
        await dbContext.SaveChangesAsync();

        LogEventosBrutosRepositorio repositorio = new(dbContext);

        IReadOnlyList<LogEventosBrutos> resultado =
            await repositorio.ObterPagamentosAsync();

        Assert.Equal(
            [registroRecente.Id, registroAntigo.Id],
            resultado.Select(registro => registro.Id));
    }

    private static AppDbContext CriarDbContext()
    {
        DbContextOptions<AppDbContext> options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static LogEventosBrutos CriarRegistro(
        string transacaoId,
        DateTime dataRecebimento)
    {
        return new LogEventosBrutos
        {
            Id = Guid.NewGuid(),
            TransacaoId = transacaoId,
            ContratoId = "contrato-1",
            Valor = 100,
            DataPagamento = dataRecebimento,
            StatusRecebido = "RECEBIDO",
            PayloadBruto = "{}",
            StatusProcessamento = StatusProcessamento.Sucesso,
            DataRecebimento = dataRecebimento
        };
    }
}
