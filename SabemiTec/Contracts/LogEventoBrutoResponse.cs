namespace SabemiTec.Contracts;

public record LogEventoBrutoResponse(
    Guid Id,
    string? TransacaoId,
    string? ContratoId,
    decimal? Valor,
    DateTime? DataPagamento,
    string? StatusRecebido,
    string StatusProcessamento,
    string? MensagemErro,
    DateTime DataRecebimento);
