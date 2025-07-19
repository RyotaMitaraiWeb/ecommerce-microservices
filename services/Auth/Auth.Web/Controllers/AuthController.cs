using Auth.Dto;
using Auth.Services.Contracts;
using Jwt.Dto;
using Jwt.Services.Contracts;
using Jwt.Util;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Auth.Web.Controllers
{
    [ApiController]
    [Route("auth")]

    public class AuthController(IUserService userService, IJwtService jwtService) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto login)
        {
            var data = await userService.CheckCredentials(login);

            if (data.Value is not SuccessfulAuthenticationDto result)
            {
                return Unauthorized();
            }

            AuthPayloadDto payload = await CreateAuthPayload(result);

            // returning an empty string for location for now, as the API isn't exposing
            // a details endpoint for users
            return Created(string.Empty, payload);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto register)
        {
            var data = await userService.CreateUser(register);
            if (data.Value is not SuccessfulAuthenticationDto result)
            {
                return Unauthorized();
            }

            AuthPayloadDto payload = await CreateAuthPayload(result);

            // returning an empty string for location for now, as the API isn't exposing
            // a details endpoint for users
            return Created(string.Empty, payload);
        }

        [Authorize]
        [HttpPost("session")]
        public async Task<IActionResult> VerifySession([FromHeader(Name = "Authorization")] string? token)
        {
            UserClaimsDto claims = await jwtService.ReadTokenAsync(token);
            var payload = new AuthPayloadDto()
            {
                Token = TokenUtil.RemoveBearer(token),
                User = claims,
            };

            return Created(string.Empty, payload);
        }

        private static UserClaimsDto CreateClaims(SuccessfulAuthenticationDto data)
        {
            return new UserClaimsDto()
            {
                Email = data.Email,
                Id = data.Id,
            };
        }

        private async Task<AuthPayloadDto> CreateAuthPayload(SuccessfulAuthenticationDto data)
        {
            UserClaimsDto claims = CreateClaims(data);
            CreatedJwtDto jwt = await jwtService.CreateTokenAsync(claims);

            return new AuthPayloadDto()
            {
                Token = jwt.Token,
                User = claims,
            };
        }
    }
}
