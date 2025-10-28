using Channel.Services.Contracts;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using ProductsApi.Dto;
using ProductsApi.Enums;
using ProductsApi.Services;
using Tests.Util.Retry;

namespace Tests.Unit.Services
{
    public class ProductsApiTests
    {
        public IConfiguration Configuration { get; set; }
        public IChannelService ChannelService { get; set; }
        public string Queue { get; set; }
        public ProductApiService ProductApiService { get; set; }

        [SetUp]
        public void SetUp()
        {
            this.Configuration = Substitute.For<IConfiguration>();
            Queue = Guid.NewGuid().ToString();
            this.Configuration["RABBITMQ_INIT_PROFILE_QUEUE"] = Queue;

            this.ChannelService = Substitute.For<IChannelService>();
            this.ProductApiService = new ProductApiService(Configuration, ChannelService, new OneTimeRetryProfileInit());
        }

        [Test]
        public async Task InitializeProfile_ReturnsCorrectResponseWhenSuccessful()
        {
            // Arrange
            string email = "abc@abc.com";
            int id = 1;

            var payload = new InitializeProfilePayloadDto()
            {
                Email = email,
            };

            var profileResult = new InitializeProfileResultDto()
            {
                Id = id,
                Email = email,
            };

            var rpcResponse = new NestRpcResponse<InitializeProfileResultDto>()
            {
                IsDisposed = false,
                Response = profileResult,
            };

            ChannelService
                .PublishRpcMessage<InitializeProfilePayloadDto, NestRpcResponse<InitializeProfileResultDto>>(
                    Arg.Is<InitializeProfilePayloadDto>(p => p.Email == email),
                    ProductsApi.Constants.Patterns.InitializeProfile,
                    Queue,
                    "jwt")
                .Returns(rpcResponse);

            // Act
            var result = await ProductApiService.InitializeProfile(payload, "jwt");
            var response = result.AsT0;

            // Assert
            Assert.That(response.Email, Is.EqualTo(email));
            Assert.That(response.Id, Is.EqualTo(id));
        }

        [Test]
        public async Task InitializeProfile_ReturnsErrorIfAnExceptionIsThrown()
        {
            // Arrange
            string email = "abc@abc.com";
            int id = 1;

            var payload = new InitializeProfilePayloadDto()
            {
                Email = email,
            };

            ChannelService
                .PublishRpcMessage<InitializeProfilePayloadDto, NestRpcResponse<InitializeProfileResultDto>>(
                    Arg.Is<InitializeProfilePayloadDto>(p => p.Email == email),
                    ProductsApi.Constants.Patterns.InitializeProfile,
                    Queue,
                    "jwt")
                .ThrowsAsync(new Exception());

            // Act
            var result = await ProductApiService.InitializeProfile(payload, "jwt");
            var response = result.AsT1;

            // Assert
            Assert.That(response, Is.EqualTo(InitializeProfileErrors.ServerError));
        }

        [TearDown]
        public async Task TearDown()
        {
            await ChannelService.DisposeAsync();
        }
    }
}
