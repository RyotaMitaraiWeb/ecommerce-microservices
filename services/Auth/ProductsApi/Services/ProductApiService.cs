using Channel.Services.Contracts;
using Microsoft.Extensions.Configuration;
using OneOf;
using Polly.Retry;
using ProductsApi.Constants;
using ProductsApi.Dto;
using ProductsApi.Enums;
using ProductsApi.Retry;
using ProductsApi.Services.Contracts;

namespace ProductsApi.Services
{
    public class ProductApiService(IConfiguration config, IChannelService channelService, IRetryProfileInit retry) : IProductApiService
    {
        private readonly string queue = config["RABBITMQ_INIT_PROFILE_QUEUE"] ?? throw new NullReferenceException(nameof(queue));
        public async Task<OneOf<InitializeProfileResultDto, InitializeProfileErrors>> InitializeProfile(InitializeProfilePayloadDto payload)
        {
            AsyncRetryPolicy retryPolicy = retry.Policy;

            try
            {
                NestRpcResponse<InitializeProfileResultDto> result = await retryPolicy.ExecuteAsync(async () =>
                {
                    return await channelService
                        .PublishRpcMessage<InitializeProfilePayloadDto, NestRpcResponse<InitializeProfileResultDto>>(
                            payload: payload,
                            pattern: Patterns.InitializeProfile,
                            queue: queue);
                });

                return result.Response!;
            }
            catch (Exception ex)
            {
                return InitializeProfileErrors.ServerError;
            }
        }
    }
}
