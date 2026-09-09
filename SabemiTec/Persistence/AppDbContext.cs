using Microsoft.EntityFrameworkCore;

namespace SabemiTec.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options) 
{
}
