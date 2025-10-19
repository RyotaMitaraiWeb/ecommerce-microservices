using Polly;
using Polly.Retry;

namespace ProductsApi.Retry
{
    public interface IRetryProfileInit
    {
        AsyncRetryPolicy Policy { get; }
    }
}
