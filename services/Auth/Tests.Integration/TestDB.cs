using Database;
using Microsoft.EntityFrameworkCore;

namespace Tests.Integration
{
    public abstract class TestDB
    {
        public static AppDbContext GetDbContext()
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseInMemoryDatabase(Guid.NewGuid().ToString());
            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
