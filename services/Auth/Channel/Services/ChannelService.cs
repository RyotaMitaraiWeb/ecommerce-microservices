using Channel.Dto;
using Channel.Services.Contracts;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
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
        private readonly int port = int.Parse(config["RABBITMQ_PORT"] ?? "5672");

        private readonly JsonSerializerOptions jsonSerializerOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

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
            IConnection connection = await this.GetConnectionAsync();
            await using IChannel channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                    queue: queue,
                    durable: true,
                    exclusive: false,
                    autoDelete: false
                );

            ReadOnlyMemory<byte> body = ConstructRpcRequestBody(payload, pattern);

            await channel.BasicPublishAsync(
                    exchange: "",
                    routingKey: queue,
                    mandatory: false,
                    body: body
                );
        }

        public async Task<TResponse> PublishRpcMessage<TPayload, TResponse>(
            TPayload payload,
            string pattern,
            string queue,
            string jwt,
            TimeSpan? timeout = null)
        {
            timeout ??= TimeSpan.FromSeconds(10);

            IConnection connection = await GetConnectionAsync();
            await using IChannel channel = await connection.CreateChannelAsync();

            QueueDeclareOk replyQueue = await channel.QueueDeclareAsync(
                queue: string.Empty,
                exclusive: true,
                autoDelete: true
            );

            string correlationId = Guid.NewGuid().ToString();

            ReadOnlyMemory<byte> body = ConstructRpcRequestBody(payload, pattern);

            BasicProperties props = new()
            {
                ReplyTo = replyQueue.QueueName,
                CorrelationId = correlationId,
                Headers = ConstructHeaders(jwt),

            };

            var tcs = new TaskCompletionSource<TResponse>();

            var consumer = new AsyncEventingBasicConsumer(channel);
            consumer.ReceivedAsync += async (sender, eventArgs) =>
            {
                if (eventArgs.BasicProperties.CorrelationId == correlationId)
                {
                    string responseJson = Encoding.UTF8.GetString(eventArgs.Body.ToArray());

                    try
                    {
                        TResponse? response = JsonSerializer.Deserialize<TResponse>(responseJson, jsonSerializerOptions);
                        if (response is not null)
                        {
                            tcs.TrySetResult(response);
                        }
                    }
                    catch (Exception ex)
                    {
                        tcs.TrySetException(ex);
                    }
                }
                await Task.Yield();
            };

            await channel.BasicConsumeAsync(replyQueue.QueueName, true, consumer);

            await channel.BasicPublishAsync(
                exchange: string.Empty,
                routingKey: queue,
                mandatory: false,
                basicProperties: props,
                body: body
            );

            using var cts = new CancellationTokenSource(timeout.Value);
            await using var _ = cts.Token.Register(() => tcs.TrySetCanceled(), useSynchronizationContext: false);

            return await tcs.Task;
        }

        private async Task<IConnection> GetConnectionAsync()
        {
            if (_connectionTask == null)
            {
                ConnectionFactory factory = new()
                {
                    HostName = hostName,
                    Port = port,
                    UserName = username,
                    Password = password,
                };

                _connectionTask = factory.CreateConnectionAsync();
            }

            return await _connectionTask;
        }

        private ReadOnlyMemory<byte> ConstructRpcRequestBody<TPayload>(TPayload payload, string pattern)
        {
            RpcPayload<TPayload> rpcPayload = new()
            {
                Id = Guid.NewGuid().ToString(),
                Data = payload,
                Pattern = pattern
            };

            string json = JsonSerializer.Serialize(rpcPayload, jsonSerializerOptions);
            byte[] body = Encoding.UTF8.GetBytes(json);

            return new ReadOnlyMemory<byte>(body);
        }

        private IDictionary<string, object?> ConstructHeaders(string jwt)
        {
            return new Dictionary<string, object?>()
            {
                {
                    "authorization",
                    jwt.StartsWith("Bearer ") ? jwt : $"Bearer {jwt}"
                }
            };
        }
    }

}
