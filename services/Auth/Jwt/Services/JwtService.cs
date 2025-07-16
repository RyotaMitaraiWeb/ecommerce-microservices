using Jwt.Dto;
using Jwt.Exceptions;
using Jwt.Services.Contracts;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Jwt.Constants;

namespace Jwt.Services
{
    public class JwtService(IConfiguration config) : IJwtService
    {
        private readonly string issuer = GetJwtConfigOrThrowIfNull(
            ConfigurationKeys.Issuer, config);
        private readonly string audience = GetJwtConfigOrThrowIfNull(
            ConfigurationKeys.Audience, config);
        private readonly string secret = GetJwtConfigOrThrowIfNull(
            ConfigurationKeys.Secret, config);
        private readonly int expiresInMinutes = 60 * 24; // 24 hours

        public Task<CreatedJwtDto> CreateTokenAsync(UserClaimsDto payload)
        {
            SymmetricSecurityKey securityKey = GenerateSymmetricSecurityKey();
            var now = DateTime.UtcNow;

            var claims = GenerateClaims(payload);

            var descriptor = new SecurityTokenDescriptor()
            {
                Issuer = issuer,
                IssuedAt = null,
                Audience = audience,
                SigningCredentials = new SigningCredentials(
                    securityKey, SecurityAlgorithms.HmacSha256),
                NotBefore = now,
                Expires = now.AddMinutes(expiresInMinutes),
                Subject = claims,
            };

            var handler = new JsonWebTokenHandler();
            string token = handler.CreateToken(descriptor);

            return Task.FromResult(new CreatedJwtDto
            {
                Token = token,
            });
        }

        private static string GetJwtConfigOrThrowIfNull(string envKey, IConfiguration config)
        {
            return config[envKey] 
                ?? throw new JwtConfigNullException($"Environment variable \"{envKey}\" should be a non-null value.");
        }

        private SymmetricSecurityKey GenerateSymmetricSecurityKey()
        {
            var data = Encoding.UTF8.GetBytes(secret);
            var securityKey = new SymmetricSecurityKey(data);
            return securityKey;

        }

        private static ClaimsIdentity GenerateClaims(UserClaimsDto payload)
        {
            var claims = new List<Claim>
            {
                new(UserClaims.Id, payload.Id),
                new(UserClaims.Email, payload.Email)
            };

            return new ClaimsIdentity(claims);
        }

        public Task<UserClaimsDto> ReadTokenAsync(string? token)
        {
            var handler = new JsonWebTokenHandler();
            var claims = handler.ReadJsonWebToken(token).Claims;

            string email = claims.FirstOrDefault(claim => claim.Type == UserClaims.Email)!.Value;
            string id = claims.FirstOrDefault(claim => claim.Type == UserClaims.Id)!.Value;

            return Task.FromResult(new UserClaimsDto()
            {
                Id = id,
                Email = email,
            });
        }
    }
}
