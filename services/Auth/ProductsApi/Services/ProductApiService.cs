using Channel.Services.Contracts;
using ProductsApi.Dto;
using ProductsApi.Services.Contracts;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace ProductsApi.Services
{
    public class ProductApiService(IChannelService channelService) : IProductApiService
    {
        public async Task<InitializeProfileResultDto> InitializeProfile(InitializeProfilePayloadDto payload)
        {
            var rpcPayload = new
            {
                pattern = "init_profile",
                data = new { email = payload.Email }
            };
            var connection = await channelService.GetConnectionAsync();
            await using var channel = await connection.CreateChannelAsync();

            Console.WriteLine("TEST");

            await channel.QueueDeclareAsync(
                    queue: "profile_init",
                    durable: true,
                    exclusive: false,
                    autoDelete: false
                );

            var json = JsonSerializer.Serialize(rpcPayload);
            var body = Encoding.UTF8.GetBytes(json);

            await channel.BasicPublishAsync(
                    exchange: "",
                    routingKey: "profile_init",
                    mandatory: false,
                    body: new ReadOnlyMemory<byte>(body)
                );

            return new InitializeProfileResultDto()
            {
                Email = payload.Email
            };
        }
    }
}
