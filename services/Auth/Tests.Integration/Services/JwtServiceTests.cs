using Jwt.Constants;
using Jwt.Dto;
using Jwt.Exceptions;
using Jwt.Services;
using Microsoft.Extensions.Configuration;
using NSubstitute;

namespace Tests.Integration.Services
{
    public class JwtServiceTests
    {
        private IConfiguration configuration;
        public JwtService Service { get; set; }

        [SetUp]
        public void SetUp()
        {
            configuration = Substitute.For<IConfiguration>();
            configuration["AUTH_JWT_ISSUER"] = "issuer";
            configuration["AUTH_JWT_AUDIENCE"] = "audience";
            configuration["AUTH_JWT_SECRET"] = "OPQWMTNOnmjkq3njk3n2039n2jklnjwknw2jk3n2jlk3nkj23n5jkl23n5kj23n5kj23n5jk23n";
            Service = new JwtService(configuration);
        }

        [Test]
        public async Task CreateTokenAsync_ReturnsCreatedJwtDtoWhenSuccessful()
        {
            // Arrange
            var payload = new { Test = "1" };

            // Act
            var result = await Service.CreateTokenAsync(payload);

            // Assert

            // HmacSha256 is deterministic, but to make the tests less shaky,
            // (e.g. if the algorithm itself changes)
            // we will just check if we got something resembling a token
            Assert.That(result.Token, Has.Length.GreaterThan(10));
        }

        [Test]
        [TestCase(ConfigurationKeys.Issuer)]
        [TestCase(ConfigurationKeys.Audience)]
        [TestCase(ConfigurationKeys.Secret)]
        public void Constructor_ThrowsIfOneOfTheConfigurationsIsNull(string key)
        {
            // Arrange
            configuration[key] = null;

            // Act
            var execution = () => new JwtService(configuration);

            // Assert
            Assert.That(execution, Throws.InstanceOf<JwtConfigNullException>());
        }

        [Test]
        public async Task ReadTokenAsync_ReturnsClaimsWhenTokenIsReadSuccessfully()
        {
            // Arrange
            var claims = new UserClaimsDto()
            {
                Email = "abc@abc.com",
                Id = Guid.NewGuid().ToString(),
            };

            var result = await Service.CreateTokenAsync(claims);
            string token = result.Token;

            // Act
            var claimsResult = await Service.ReadTokenAsync(token);

            // Assert
            Assert.Multiple(() =>
            {
                Assert.That(claimsResult.Id, Is.EqualTo(claims.Id));
                Assert.That(claimsResult.Email, Is.EqualTo(claims.Email));
            });
        }
    }
}
