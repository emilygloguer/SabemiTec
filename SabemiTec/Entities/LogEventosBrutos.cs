using Microsoft.EntityFrameworkCore;

namespace SabemiTec.Entities;

public enum StatusProcessamento
{
    Pendente,
    Sucesso,
    Erro
}

[Index(nameof(TransacaoId), IsUnique = true)]
public class LogEventosBrutos
{
    public Guid Id { get; set; }
    public string? TransacaoId { get; set; } = string.Empty;
    public string? ContratoId { get; set; }
    public decimal  Valor { get; set; }
    public DateTime DataPagamento { get; set; }
    public string? StatusRecebido { get; set; } = string.Empty;
    public string PayloadBruto { get; set; } = string.Empty;
    public StatusProcessamento StatusProcessamento { get; set; }
    public string? MensagemErro { get; set; }
    public DateTime DataRecebimento { get; set; }
}
