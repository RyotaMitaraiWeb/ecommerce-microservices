using Common.Retry;
using Polly.Retry;
using ProductsApi.Retry;

namespace Tests.Util.Retry
{
    public class OneTimeRetryProfileInit : IRetryProfileInit
    {
        public AsyncRetryPolicy Policy => RetryPolicies.GetRetryPolicy<Exception>(1);
    }
}
