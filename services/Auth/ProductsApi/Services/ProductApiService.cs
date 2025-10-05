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
            var connection = await channelService.GetConnectionAsync();
            await using var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                    queue: "init_profile",
                    durable: true,
                    exclusive: false,
                    autoDelete: false
                );

            var json = JsonSerializer.Serialize(payload);
            var body = Encoding.UTF8.GetBytes(json);

            await channel.BasicPublishAsync(
                    exchange: "",
                    routingKey: "init_profile",
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
