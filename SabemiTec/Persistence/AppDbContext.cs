using Microsoft.EntityFrameworkCore;
using SabemiTec.Entities;

namespace SabemiTec.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options) 
{
    public DbSet<LogEventosBrutos> LogsEventosBrutos { get; set; }
    public DbSet<StatusDoContrato> StatusDosContratos { get; set; }
}
