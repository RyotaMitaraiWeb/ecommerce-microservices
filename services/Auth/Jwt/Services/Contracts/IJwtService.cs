using Jwt.Dto;

namespace Jwt.Services.Contracts
{
    public interface IJwtService
    {
        Task<CreatedJwtDto> CreateTokenAsync(object payload);
    }
}
