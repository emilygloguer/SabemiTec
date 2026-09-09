using System.Text.Json;
using SabemiTec.Contracts;
using SabemiTec.Entities;

namespace SabemiTec.Services;

public static class WebhookExtensions
{
    public static LogEventosBrutos ConverterParaLogEventosBrutos(this PaymentWebhookRequest payload) => 
        new()
        {
            Id = Guid.NewGuid(),
            TransacaoId = payload.IdTransacao,
            ContratoId = payload.IdContrato,
            Valor = payload.Valor,
            DataPagamento = payload.DataPagamento,
            StatusRecebido = payload.Status,
            PayloadBruto = JsonSerializer.Serialize(payload),
            StatusProcessamento = StatusProcessamento.Pendente,
            DataRecebimento = DateTime.UtcNow
        };

    public static LogEventoBrutoResponse Resumo(this LogEventosBrutos registro) => 
        new(
            registro.Id,
            registro.TransacaoId,
            registro.ContratoId ?? throw new InvalidOperationException(
                $"O registro {registro.TransacaoId} não possui contrato informado."),
            registro.Valor,
            registro.DataPagamento,
            registro.StatusRecebido,
            registro.StatusProcessamento.ToString(),
            registro.MensagemErro,
            registro.DataRecebimento);

    public static StatusDoContrato CriarStatusDoContrato(this LogEventosBrutos registro)
    {
        string contratoId = registro.ContratoId ?? throw new InvalidOperationException(
            $"O registro {registro.TransacaoId} não possui contrato informado.");

        StatusDoContrato statusDoContrato = registro.StatusDoContrato ?? new StatusDoContrato
        {
            ContratoId = contratoId
        };

        statusDoContrato.Status = registro.StatusProcessamento switch
        {
            StatusProcessamento.Sucesso => StatusContrato.Sucesso,
            StatusProcessamento.Erro => StatusContrato.Erro,
            _ => StatusContrato.Erro
        };
        statusDoContrato.UltimoPagamento = registro.DataPagamento;
        statusDoContrato.ValorUltimoPagamento = registro.Valor;
        statusDoContrato.AtualizadoEm = DateTime.UtcNow;

        registro.StatusDoContrato = statusDoContrato;

        return statusDoContrato;
    }
}
