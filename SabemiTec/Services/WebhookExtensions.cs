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
            TransacaoId = Normalizar(payload.IdTransacao),
            ContratoId = Normalizar(payload.IdContrato),
            Valor = payload.Valor ?? 0 ,
            DataPagamento = payload.DataPagamento ?? DateTime.MinValue,
            StatusRecebido = Normalizar(payload.Status),
            PayloadBruto = JsonSerializer.Serialize(payload),
            StatusProcessamento = StatusProcessamento.Pendente,
            DataRecebimento = DateTime.UtcNow
        };

    public static LogEventoBrutoResponse Resumo(this LogEventosBrutos registro) => 
        new(
            registro.Id,
            registro.TransacaoId,
            registro.ContratoId,
            registro.Valor,
            registro.DataPagamento,
            registro.StatusRecebido,
            registro.StatusProcessamento.ToString(),
            registro.MensagemErro,
            registro.DataRecebimento);

    public static StatusDoContrato CriarOuAtualizarStatusDoContrato(
        this LogEventosBrutos registro,
        StatusDoContrato? statusExistente)
    {
        if (string.IsNullOrWhiteSpace(registro.ContratoId))
            throw new InvalidOperationException(
                $"O registro {registro.Id} não possui contrato informado.");

        if (registro.DataPagamento == DateTime.MinValue)
            throw new InvalidOperationException(
                $"O registro {registro.Id} não possui data de pagamento.");

        if (registro.Valor == 0)
            throw new InvalidOperationException(
                $"O registro {registro.Id} não possui valor.");

        StatusDoContrato statusDoContrato =
            statusExistente ?? new StatusDoContrato
            {
                ContratoId = registro.ContratoId
            };

        statusDoContrato.Status = registro.StatusProcessamento switch
        {
            StatusProcessamento.Sucesso => StatusContrato.Sucesso,
            StatusProcessamento.Erro => StatusContrato.Erro,
            _ => throw new InvalidOperationException(
                "Não é possível atualizar o contrato para um evento pendente.")
        };

        statusDoContrato.UltimoPagamento = registro.DataPagamento;
        statusDoContrato.ValorUltimoPagamento = registro.Valor;
        statusDoContrato.AtualizadoEm = DateTime.UtcNow;

        return statusDoContrato;
    }

    private static string? Normalizar(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return null;

        return valor.Trim();
    }
}
