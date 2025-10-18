using Common.Retry;
using Polly.Retry;

namespace ProductsApi.Retry
{
    public class RetryProfileInit : IRetryProfileInit
    {
        public AsyncRetryPolicy Policy { get; }

        public RetryProfileInit()
        {
            Policy = RetryPolicies.GetRetryPolicy<Exception>(3);
        }
    }
}
