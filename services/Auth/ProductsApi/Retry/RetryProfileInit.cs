using Common.Retry;
using Polly.Retry;
using ProductsApi.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
