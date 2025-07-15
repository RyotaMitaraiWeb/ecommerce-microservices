using Jwt.Dto;

namespace Jwt.Services.Contracts
{
    public interface IJwtService
    {
        Task<CreatedJwtDto> CreateTokenAsync(UserClaimsDto payload);
        Task<UserClaimsDto> ReadTokenAsync(string? token);
    }
}
