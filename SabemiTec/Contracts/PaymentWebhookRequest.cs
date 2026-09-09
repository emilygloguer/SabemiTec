namespace SabemiTec.Contracts;

public record PaymentWebhookRequest(
    string IdTransacao,
    string IdContrato,
    decimal Valor,
    DateTime DataPagamento,
    string Status);
