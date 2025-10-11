using Channel.Dto;
using Channel.Services.Contracts;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Channel.Services
{
    public class ChannelService(IConfiguration config) : IChannelService
    {
        private Task<IConnection>? _connectionTask;
        private readonly string hostName = config["RABBITMQ_HOST"] ?? throw new NullReferenceException(nameof(hostName));
        private readonly string username = config["RABBITMQ_USER"] ?? throw new NullReferenceException(nameof(username));
        private readonly string password = config["RABBITMQ_PASSWORD"] ?? throw new NullReferenceException(nameof(password));

        private readonly JsonSerializerOptions jsonSerializerOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        private async Task<IConnection> GetConnectionAsync()
        {
            if (_connectionTask == null)
            {
                var factory = new ConnectionFactory
                {
                    HostName = hostName,
                    Port = 5672,
                    UserName = username,
                    Password = password,
                };

                _connectionTask = factory.CreateConnectionAsync();
            }

            return await _connectionTask;
        }

        public async ValueTask DisposeAsync()
        {
            if (_connectionTask != null)
            {
                var connection = await _connectionTask;
                if (connection.IsOpen)
                {
                    await connection.CloseAsync();
                    await connection.DisposeAsync();
                    GC.SuppressFinalize(this);
                }
            }
        }

        public async Task PublishMessage<TPayload>(TPayload payload, string pattern, string queue)
        {
            var connection = await this.GetConnectionAsync();
            await using var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                    queue: queue,
                    durable: true,
                    exclusive: false,
                    autoDelete: false
                );

            var rpcPayload = new RpcPayload<TPayload>()
            {
                Data = payload,
                Pattern = pattern,
            };

            var json = JsonSerializer.Serialize(rpcPayload, jsonSerializerOptions);
            var body = Encoding.UTF8.GetBytes(json);

            await channel.BasicPublishAsync(
                    exchange: "",
                    routingKey: queue,
                    mandatory: false,
                    body: new ReadOnlyMemory<byte>(body)
                );
        }
    }

}
