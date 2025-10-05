using Channel.Services.Contracts;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;

namespace Channel.Services
{
    public class ChannelService(IConfiguration config) : IChannelService
    {
        private Task<IConnection>? _connectionTask;
        private readonly string hostName = config["RABBITMQ_HOST"] ?? throw new NullReferenceException(nameof(hostName));
        private readonly string username = config["RABBITMQ_USER"] ?? throw new NullReferenceException(nameof(username));
        private readonly string password = config["RABBITMQ_PASSWORD"] ?? throw new NullReferenceException(nameof(password));

        public async Task<IConnection> GetConnectionAsync()
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
    }

}
