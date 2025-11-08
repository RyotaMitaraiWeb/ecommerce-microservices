using Auth.Dto;
using Auth.Enums;
using Auth.Services.Contracts;
using Auth.Web.Controllers;
using Jwt.Dto;
using Jwt.Services.Contracts;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using ProductsApi.Dto;
using ProductsApi.Enums;
using ProductsApi.Services.Contracts;

namespace Tests.Unit.Controllers
{
    public class AuthControllerTests
    {
        public AuthController Controller { get; set; }
        private IUserService UserService { get; set; }
        private IJwtService JwtService { get; set; }
        private IProductApiService ProductsApi { get; set; }


        [SetUp]
        public void Setup()
        {
            UserService = Substitute.For<IUserService>();
            JwtService = Substitute.For<IJwtService>();
            ProductsApi = Substitute.For<IProductApiService>();
            Controller = new AuthController(UserService, JwtService, ProductsApi);
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
        public async Task Register_ReturnsUnauthorizedIfAnErrorIsReturnedFromTheUserService(CreateUserError error)
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

            var initializedProfile = new InitializeProfileResultDto()
            {
                Email = successfulAuth.Email,
                Id = 1,
            };

            string token = "a";

            var createdToken = new CreatedJwtDto()
            {
                Token = token,
            };

            UserService
                .CreateUser(register)
                .Returns(successfulAuth);

            JwtService
                .CreateTokenAsync(claims)
                .ReturnsForAnyArgs(createdToken);

            ProductsApi
                .InitializeProfile(createdToken.Token)
                .Returns(initializedProfile);

            // Act
            var result = await Controller.Register(register);

            // Assert
            var response = result as CreatedResult;
            Assert.That(response?.StatusCode, Is.EqualTo(201));

            var value = response.Value as AuthPayloadDto;

            Assert.That(value?.Token, Is.EqualTo(token));
            Assert.That(value.User.Email, Is.EqualTo(claims.Email));
        }

        [Test]
        public async Task Register_ReturnsInteralServerErrorWhenInitializationFailsAndDeletesTheProfile()
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

            string token = "a";

            var claims = new UserClaimsDto()
            {
                Email = successfulAuth.Email,
                Id = successfulAuth.Id,
            };

            var createdToken = new CreatedJwtDto()
            {
                Token = token,
            };

            JwtService
                .CreateTokenAsync(claims)
                .ReturnsForAnyArgs(createdToken);

            UserService
                .CreateUser(register)
                .Returns(successfulAuth);

            ProductsApi
                .InitializeProfile(createdToken.Token)
                .Returns(InitializeProfileErrors.ServerError);

            // Act
            var result = await Controller.Register(register);

            // Assert
            var response = result as StatusCodeResult;
            Assert.That(response?.StatusCode, Is.EqualTo(500));

            await UserService.Received(1).DeleteUser(successfulAuth.Id);
        }

        [Test]
        public async Task VerifySession_ReturnsCreatedWhenSuccessful()
        {
            // Arrange
            string token = "a";
            var claims = new UserClaimsDto()
            {
                Email = "abc@abc.com",
                Id = Guid.NewGuid().ToString(),
            };

            JwtService.ReadTokenAsync(token).Returns(claims);

            // Act
            var result = await Controller.VerifySession(token);

            // Assert
            var response = result as CreatedResult;
            Assert.That(response?.StatusCode, Is.EqualTo(201));

            var value = response.Value as AuthPayloadDto;
            Assert.That(value?.Token, Is.EqualTo(token));
            Assert.That(value.User.Email, Is.EqualTo(claims.Email));
        }
    }
}
