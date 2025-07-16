using Auth.Dto;
using Auth.Enums;
using Auth.Services;
using Common.Extensions;
using Database;
using Microsoft.EntityFrameworkCore;
using Tests.Util;

namespace Tests.Integration.Services
{
    public class UserServiceTests
    {
        private AppDbContext DbContext { get; set; }
        public UserService Service { get; set; }

        [SetUp]
        public async Task SetUp()
        {
            DbContext = await TestDB.GetDbContext();
            Service = new UserService(DbContext);
        }

        [Test]
        public async Task CreateUser_ReturnsErrorWhenEmailAlreadyExists()
        {
            // Arrange
            string existingEmail = TestDB.Users[0].Email;
            var register = new RegisterDto()
            {
                Email = existingEmail,
                Password = "kwemlkm21lk32!@"
            };

            // Act
            var result = await Service.CreateUser(register);

            // Assert
            Assert.That(result.Value, Is.EqualTo(CreateUserError.EmailIsTaken));
        }

        [Test]
        public async Task CreateUser_ReturnsDtoWhenSuccessful()
        {
            // Arrange
            var register = new RegisterDto()
            {
                Email = "myemail@test.com",
                Password = "Astrong!password1",
            };

            // Act
            var result = await Service.CreateUser(register);

            // Assert
            var user = await DbContext.Users.FirstOrDefaultAsync(user => user.Email == register.Email);
            Assert.That(user, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(user.Id, Is.EqualTo(Guid.Parse(result.AsT0.Id)));
                Assert.That(user.Email, Is.EqualTo(result.AsT0.Email));
                Assert.That(user.NormalizedEmail, Is.EqualTo(result.AsT0.Email.DatabaseNormalize()));
            });
        }
    }
}
