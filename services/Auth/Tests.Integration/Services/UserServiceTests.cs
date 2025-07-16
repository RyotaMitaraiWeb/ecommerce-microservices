using Auth.Services;
using Database;

namespace Tests.Integration.Services
{
    public class UserServiceTests
    {
        private AppDbContext DbContext { get; set; }
        public UserService Service { get; set; }

        [SetUp]
        public void SetUp()
        {
            DbContext = TestDB.GetDbContext();
            Service = new UserService(DbContext);
        }

        [TearDown]
        public void TearDown()
        {
            DbContext.Dispose();
        }
    }
}
