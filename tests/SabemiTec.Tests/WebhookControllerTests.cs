using Microsoft.AspNetCore.Mvc;
using Moq;
using SabemiTec.Contracts;
using SabemiTec.Controllers;
using SabemiTec.Services;
using Xunit;

namespace SabemiTec.Tests;

public class WebhookControllerTests
{
    [Fact]
    public async Task ListarPagamentos_deve_retornar_ok_com_os_pagamentos_do_servico()
    {
        IReadOnlyList<LogEventoBrutoResponse> pagamentos =
        [
            new(
                Guid.NewGuid(),
                "transacao-1",
                "contrato-1",
                100,
                new DateTime(2026, 9, 10),
                "RECEBIDO",
                "Sucesso",
                null,
                new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc))
        ];

        Mock<IWebhookService> service = new();
        service
            .Setup(item => item.ObterPagamentosAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagamentos);

        WebhookController controller = new(service.Object);

        IActionResult resultado = await controller.ListarPagamentos(CancellationToken.None);

        OkObjectResult resposta = Assert.IsType<OkObjectResult>(resultado);
        Assert.Same(pagamentos, resposta.Value);
    }
}
