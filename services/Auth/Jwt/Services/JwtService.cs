using Jwt.Dto;
using Jwt.Exceptions;
using Jwt.Services.Contracts;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Jwt.Services
{
    public class JwtService(IConfiguration config) : IJwtService
    {
        private readonly string issuer = GetJwtConfigOrThrowIfNull("AUTH_JWT_ISSUER", config);
        private readonly string audience = GetJwtConfigOrThrowIfNull("AUTH_JWT_AUDIENCE", config);
        private readonly string secret = GetJwtConfigOrThrowIfNull("AUTH_JWT_SECRET", config);
        private readonly int expiresInMinutes = 60 * 24; // 24 hours

        public Task<CreatedJwtDto> CreateTokenAsync(object payload)
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

        private static ClaimsIdentity GenerateClaims(object payload)
        {
            var claims = new List<Claim>();
            foreach (var prop in payload.GetType().GetProperties())
            {
                var value = prop.GetValue(payload)?.ToString();
                if (value != null)
                {
                    claims.Add(new Claim(prop.Name, value));
                }
            }

            return new ClaimsIdentity(claims);
        }
    }
}
