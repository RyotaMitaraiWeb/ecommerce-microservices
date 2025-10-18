using Polly;
using Polly.Retry;

namespace ProductsApi.Constants
{
    public static class RetryPolicies
    {
        public static AsyncRetryPolicy GetRetryPolicy(int retryCount = 3) =>
            Policy
                .Handle<Exception>()
                .WaitAndRetryAsync(
                    retryCount: retryCount,
                    sleepDurationProvider: ExpontentialBackOff,
                    onRetry: (exception, delay, attempt, context) =>
                    {
                        Console.WriteLine($"⚠️ Retry {attempt} after {delay.TotalSeconds}s due to {exception.Message}");
                    });

        private static readonly Func<int, TimeSpan> ExpontentialBackOff =
            (int attempt) => TimeSpan.FromSeconds(Math.Pow(2, attempt));
    }
}
