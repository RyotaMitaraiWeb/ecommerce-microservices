using Channel.Services.Contracts;
using Microsoft.Extensions.Configuration;
using ProductsApi.Dto;
using ProductsApi.Services.Contracts;

namespace ProductsApi.Services
{
    public class ProductApiService(IConfiguration config, IChannelService channelService) : IProductApiService
    {
        private readonly string queue = config["RABBITMQ_INIT_PROFILE_QUEUE"] ?? throw new NullReferenceException(queue);
        public async Task<InitializeProfileResultDto> InitializeProfile(InitializeProfilePayloadDto payload)
        {
            NestRpcResponse<InitializeProfileResultDto> result = await channelService
                .PublishRpcMessage<InitializeProfilePayloadDto, NestRpcResponse<InitializeProfileResultDto>>(
                    payload: payload,
                    pattern: "init_profile",
                    queue: queue);

            return result.Response!;
        }
    }
}
