using Auth.Dto;
using Auth.Enums;
using Auth.Services.Contracts;
using Auth.Web.Controllers;
using Jwt.Dto;
using Jwt.Services.Contracts;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;

namespace Tests.Unit.Controllers
{
    public class AuthControllerTests
    {
        public AuthController Controller { get; set; }
        private IUserService UserService { get; set; }
        private IJwtService JwtService { get; set; }

        [SetUp]
        public void Setup()
        {
            UserService = Substitute.For<IUserService>();
            JwtService = Substitute.For<IJwtService>();
            Controller = new AuthController(UserService, JwtService);
        }

        [Test]
        [TestCase(CheckCredentialsError.NonExistantEmail)]
        [TestCase(CheckCredentialsError.WrongPassword)]
        public async Task Login_ReturnsUnauthorizedIfAnErrorIsReturned(CheckCredentialsError error)
        {
            // Arrange
            var login = new LoginDto()
            {
                Email = "abc@abc.com",
                Password = "A!strongpassword1",
            };

            UserService.CheckCredentials(login).Returns(error);

            // Act
            var result = await Controller.Login(login);

            // Assert
            var response = result as UnauthorizedResult;
            Assert.That(response?.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task Login_ReturnsCreatedIfSuccessful()
        {
            // Arrange
            var login = new LoginDto()
            {
                Email = "abc@abc.com",
                Password = "A!strongpassword1",
            };

            var successfulAuth = new SuccessfulAuthenticationDto()
            {
                Email = login.Email,
                Id = Guid.NewGuid().ToString(),
            };

            var claims = new UserClaimsDto()
            {
                Email = successfulAuth.Email,
                Id = successfulAuth.Id,
            };

            string token = "a";

            var createdToken = new CreatedJwtDto()
            {
                Token = token,
            };

            UserService.CheckCredentials(login).Returns(successfulAuth);
            JwtService.CreateTokenAsync(claims).ReturnsForAnyArgs(createdToken);

            // Act
            var result = await Controller.Login(login);

            // Assert
            var response = result as CreatedResult;
            Assert.That(response?.StatusCode, Is.EqualTo(201));

            var value = response.Value as AuthPayloadDto;

            Assert.That(value?.Token, Is.EqualTo(token));
            Assert.That(value.User.Email, Is.EqualTo(claims.Email));
        }

        [Test]
        [TestCase(CreateUserError.EmailIsTaken)]
        public async Task Register_ReturnsUnauthorizedIfAnErrorIsReturned(CreateUserError error)
        {
            // Arrange
            var register = new RegisterDto()
            {
                Email = "abc@abc.com",
                Password = "A!strongpassword1",
            };

            UserService.CreateUser(register).Returns(error);

            // Act
            var result = await Controller.Register(register);

            // Assert
            var response = result as UnauthorizedResult;
            Assert.That(response?.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task Register_ReturnsCreatedIfSuccessful()
        {
            // Arrange
            var register = new RegisterDto()
            {
                Email = "abc@abc.com",
                Password = "A!strongpassword1",
            };

            var successfulAuth = new SuccessfulAuthenticationDto()
            {
                Email = register.Email,
                Id = Guid.NewGuid().ToString(),
            };

            var claims = new UserClaimsDto()
            {
                Email = successfulAuth.Email,
                Id = successfulAuth.Id,
            };

            string token = "a";

            var createdToken = new CreatedJwtDto()
            {
                Token = token,
            };

            UserService.CreateUser(register).Returns(successfulAuth);
            JwtService.CreateTokenAsync(claims).ReturnsForAnyArgs(createdToken);

            // Act
            var result = await Controller.Register(register);

            // Assert
            var response = result as CreatedResult;
            Assert.That(response?.StatusCode, Is.EqualTo(201));

            var value = response.Value as AuthPayloadDto;

            Assert.That(value?.Token, Is.EqualTo(token));
            Assert.That(value.User.Email, Is.EqualTo(claims.Email));
        }
    }
}
