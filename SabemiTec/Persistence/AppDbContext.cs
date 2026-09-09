using Microsoft.EntityFrameworkCore;
using SabemiTec.Entities;

namespace SabemiTec.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options) 
{
    public DbSet<LogEventosBrutos> LogsEventosBrutos { get; set; }
    public DbSet<StatusDoContrato> StatusDosContratos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LogEventosBrutos>()
            .HasOne(log => log.StatusDoContrato)
            .WithMany()
            .HasForeignKey(log => log.ContratoId)
            .HasPrincipalKey(status => status.ContratoId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
