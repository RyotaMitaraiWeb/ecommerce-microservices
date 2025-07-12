using Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace Database
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
    }
}
