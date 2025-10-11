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
                Id = Guid.NewGuid().ToString(),
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

        public async Task<TResponse> PublishNestJsRpcMessage<TPayload, TResponse>(
            TPayload payload,
            string pattern,
            string queue,
            TimeSpan? timeout = null)
        {
            timeout ??= TimeSpan.FromSeconds(10);

            var connection = await GetConnectionAsync();
            await using var channel = await connection.CreateChannelAsync();

            // Create an exclusive reply queue for this RPC call
            var replyQueue = await channel.QueueDeclareAsync(
                queue: string.Empty,
                exclusive: true,
                autoDelete: true
            );

            var correlationId = Guid.NewGuid().ToString();

            // Prepare the payload in the same structure NestJS expects
            var rpcPayload = new RpcPayload<TPayload>
            {
                Id = Guid.NewGuid().ToString(),
                Data = payload,
                Pattern = pattern
            };

            var json = JsonSerializer.Serialize(rpcPayload, jsonSerializerOptions);
            var body = Encoding.UTF8.GetBytes(json);

            var props = new BasicProperties
            {
                ReplyTo = replyQueue.QueueName,
                CorrelationId = correlationId
            };

            var tcs = new TaskCompletionSource<TResponse>();

            // Set up a consumer for the reply queue
            var consumer = new AsyncEventingBasicConsumer(channel);
            consumer.ReceivedAsync += async (sender, ea) =>
            {
                if (ea.BasicProperties.CorrelationId == correlationId)
                {
                    var responseJson = Encoding.UTF8.GetString(ea.Body.ToArray());

                    try
                    {
                        var envelope = JsonSerializer.Deserialize<NestRpcResponseEnvelope<TResponse>>(responseJson, jsonSerializerOptions);
                        if (envelope is not null && envelope.Response is not null)
                        {
                            tcs.TrySetResult(envelope.Response);
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

            // Publish the RPC request
            await channel.BasicPublishAsync(
                exchange: string.Empty,
                routingKey: queue,
                mandatory: false,
                basicProperties: props,
                body: new ReadOnlyMemory<byte>(body)
            );

            using var cts = new CancellationTokenSource(timeout.Value);
            await using var _ = cts.Token.Register(() => tcs.TrySetCanceled(), useSynchronizationContext: false);

            Console.WriteLine("Done here");
            return await tcs.Task;
        }
    }

}
