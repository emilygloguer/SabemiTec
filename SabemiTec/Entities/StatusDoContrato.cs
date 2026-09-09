using System.ComponentModel.DataAnnotations;

namespace SabemiTec.Entities;

public enum StatusContrato
{
    Sucesso,
    Erro
}

public class StatusDoContrato
{
    [Key]
    [MaxLength(100)]
    public string ContratoId { get; set; } = string.Empty;
    public StatusContrato Status { get; set; }
    public DateTime? UltimoPagamento { get; set; }
    public decimal? ValorUltimoPagamento { get; set; }
    public DateTime AtualizadoEm { get; set; }
}