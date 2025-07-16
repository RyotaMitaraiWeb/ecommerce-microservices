using Database;
using Database.Entities;
using Microsoft.EntityFrameworkCore;
using Tests.Util.Fakes;

namespace Tests.Util
{
    public abstract class TestDB
    {
        public static async Task<AppDbContext> GetDbContext()
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseInMemoryDatabase(Guid.NewGuid().ToString());
            var dbContext = new AppDbContext(optionsBuilder.Options);
            await Seed(dbContext);
            return dbContext;
        }

        public static readonly List<User> Users = [
                FakeUsers.GenerateFakeUser("abCde12@!"),
                FakeUsers.GenerateFakeUser("woekAasx!22"),
                FakeUsers.GenerateFakeUser("Astrongpassword1!"),
            ];

        private static async Task Seed(AppDbContext dbContext)
        {
            await dbContext.AddRangeAsync(Users);
            await dbContext.SaveChangesAsync();
        }
    }
}
