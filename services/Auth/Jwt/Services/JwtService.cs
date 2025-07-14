using Jwt.Dto;
using Jwt.Services.Contracts;

namespace Jwt.Services
{
    public class JwtService : IJwtService
    {
        public Task<CreatedJwtDto> CreateTokenAsync(object payload)
        {
            throw new NotImplementedException();
        }
    }
}
