using Moq;
using SabemiTec.Contracts;
using SabemiTec.Entities;
using SabemiTec.Persistence.Repositories;
using SabemiTec.Services;
using Xunit;

namespace SabemiTec.Tests;

public class WebhookServiceTests
{
    [Fact]
    public async Task ObterPagamentosAsync_deve_retornar_o_resumo_de_todos_os_registros()
    {
        LogEventosBrutos registro = new()
        {
            Id = Guid.NewGuid(),
            TransacaoId = "transacao-1",
            ContratoId = "contrato-1",
            Valor = 150.75m,
            DataPagamento = new DateTime(2026, 9, 10),
            StatusRecebido = "RECEBIDO",
            PayloadBruto = "payload sensível",
            StatusProcessamento = StatusProcessamento.Erro,
            MensagemErro = "Falha no processamento",
            DataRecebimento = new DateTime(2026, 9, 10, 12, 30, 0, DateTimeKind.Utc)
        };

        Mock<ILogEventosBrutosRepositorio> repositorio = new();
        repositorio
            .Setup(item => item.ObterPagamentosAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([registro]);

        WebhookService service = new(repositorio.Object);

        IReadOnlyList<LogEventoBrutoResponse> resultado =
            await service.ObterPagamentosAsync();

        LogEventoBrutoResponse pagamento = Assert.Single(resultado);
        Assert.Equal(registro.Id, pagamento.Id);
        Assert.Equal(registro.TransacaoId, pagamento.TransacaoId);
        Assert.Equal(registro.ContratoId, pagamento.ContratoId);
        Assert.Equal(registro.Valor, pagamento.Valor);
        Assert.Equal(registro.DataPagamento, pagamento.DataPagamento);
        Assert.Equal(registro.StatusRecebido, pagamento.StatusRecebido);
        Assert.Equal("Erro", pagamento.StatusProcessamento);
        Assert.Equal(registro.MensagemErro, pagamento.MensagemErro);
        Assert.Equal(registro.DataRecebimento, pagamento.DataRecebimento);
    }

    [Fact]
    public async Task ObterPagamentosAsync_deve_retornar_lista_vazia_quando_nao_houver_registros()
    {
        Mock<ILogEventosBrutosRepositorio> repositorio = new();
        repositorio
            .Setup(item => item.ObterPagamentosAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        WebhookService service = new(repositorio.Object);

        IReadOnlyList<LogEventoBrutoResponse> resultado =
            await service.ObterPagamentosAsync();

        Assert.Empty(resultado);
    }
}
