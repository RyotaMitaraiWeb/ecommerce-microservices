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

        [Test]
        public async Task CheckCredentials_ReturnsErrorWhenEmailDoesNotExist()
        {
            // Arrange
            var loginDto = new LoginDto()
            {
                Email = "a@a.com",
                Password = "reallysTrongpassword123"
            };

            // Act
            var result = await Service.CheckCredentials(loginDto);

            // Assert
            Assert.That(result.Value, Is.EqualTo(CheckCredentialsError.NonExistantEmail));
        }

        [Test]
        public async Task CheckCredentials_ReturnsErrorOnWrongPassword()
        {
            // Arrange
            var loginDto = new LoginDto()
            {
                Email = TestDB.Users[0].Email,
                Password = "reallysTrongpassword123"
            };

            // Act
            var result = await Service.CheckCredentials(loginDto);

            // Assert
            Assert.That(result.Value, Is.EqualTo(CheckCredentialsError.WrongPassword));
        }

        [Test]
        public async Task CheckCredentials_ReturnsDtoWhenSuccessful()
        {
            // Arrange
            string password = "abCde12@!";
            string email = TestDB.Users[0].Email;

            var login = new LoginDto()
            {
                Password = password,
                Email = email,
            };

            // Act
            var result = await Service.CheckCredentials(login);

            // Assert
            var user = result.AsT0;
            Assert.That(user.Email, Is.EqualTo(email));
        }

        [Test]
        public async Task DeleteUserHardDeletesAUserSuccessfully()
        {
            // Arrange
            var user = TestDB.Users[0];
            string id = user.Id.ToString();

            // Act
            await Service.DeleteUser(id);

            // Assert
            var users = this.DbContext.Users.ToList();
            Assert.That(users, Has.Count.EqualTo(TestDB.Users.Count - 1));
            Assert.That(users.Any(u => u.Id == user.Id), Is.False);
        }

        [Test]
        public async Task DeleteUserHardHandlesDeletionOfNonExistantUsersProperly()
        {
            // Arrange
            string id = Guid.NewGuid().ToString();

            // Act
            await Service.DeleteUser(id);

            // Assert - not throwing is enough
            Assert.Pass();
        }
    }
}
