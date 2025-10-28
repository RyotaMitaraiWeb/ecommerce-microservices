using RabbitMQ.Client;

namespace Channel.Services.Contracts
{
    public interface IChannelService : IAsyncDisposable
    {
        Task PublishMessage<TPayload>(TPayload payload, string pattern, string queue);
        Task<TResponse> PublishRpcMessage<TPayload, TResponse>(
            TPayload payload,
            string pattern,
            string queue,
            string jwt,
            TimeSpan? timeout = null);
    }
}
