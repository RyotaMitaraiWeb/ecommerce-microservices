using ProductsApi.Dto;

namespace ProductsApi.Services.Contracts
{
    public interface IProductApiService
    {
        Task<InitializeProfileResultDto> InitializeProfile(InitializeProfilePayloadDto payload);
    }
}
