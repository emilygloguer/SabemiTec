using System.Text.Json.Serialization;

namespace SabemiTec.Contracts;

public record PaymentWebhookRequest(
    [property: JsonPropertyName("id_transacao")]
    string? IdTransacao,

    [property: JsonPropertyName("id_contrato")]
    string? IdContrato,

    [property: JsonPropertyName("valor")]
    decimal? Valor,

    [property: JsonPropertyName("data_pagamento")]
    DateTime? DataPagamento,

    [property: JsonPropertyName("status")]
    string? Status);