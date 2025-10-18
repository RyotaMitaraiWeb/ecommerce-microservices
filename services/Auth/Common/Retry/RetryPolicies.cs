using Polly;
using Polly.Retry;

namespace Common.Retry
{
    public static class RetryPolicies
    {
        public static AsyncRetryPolicy GetRetryPolicy<TException>(int retryCount = 3) 
            where TException : Exception 
            =>
                Policy
                    .Handle<TException>()
                    .WaitAndRetryAsync(
                        retryCount: retryCount,
                        sleepDurationProvider: ExpontentialBackOff,
                        onRetry: (exception, delay, attempt, context) =>
                        {
                            Console.WriteLine($"⚠️ Retry {attempt} after {delay.TotalSeconds}s due to {exception.Message}");
                        });

        private static readonly Func<int, TimeSpan> ExpontentialBackOff =
            (attempt) => TimeSpan.FromSeconds(Math.Pow(2, attempt));
    }
}
