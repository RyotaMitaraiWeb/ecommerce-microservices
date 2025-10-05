using RabbitMQ.Client;

namespace Channel.Services.Contracts
{
    public interface IChannelService : IAsyncDisposable
    {
        Task<IConnection> GetConnectionAsync();
    }
}
