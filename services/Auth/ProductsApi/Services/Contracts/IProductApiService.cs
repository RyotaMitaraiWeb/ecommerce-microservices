using OneOf;
using ProductsApi.Dto;
using ProductsApi.Enums;

namespace ProductsApi.Services.Contracts
{
    public interface IProductApiService
    {
        Task<OneOf<InitializeProfileResultDto, InitializeProfileErrors>> InitializeProfile(string jwt);
    }
}
