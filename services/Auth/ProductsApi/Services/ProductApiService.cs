using Channel.Services.Contracts;
using ProductsApi.Dto;
using ProductsApi.Services.Contracts;

namespace ProductsApi.Services
{
    public class ProductApiService(IChannelService channelService) : IProductApiService
    {
        public async Task<InitializeProfileResultDto> InitializeProfile(InitializeProfilePayloadDto payload)
        {
            await channelService.PublishMessage(
                payload: payload,
                pattern: "init_profile",
                queue: "profile_init");

            return new InitializeProfileResultDto()
            {
                Email = payload.Email
            };
        }
    }
}
