using Auth.Dto;
using Auth.Enums;
using OneOf;

namespace Auth.Services.Contracts
{
    public interface IUserService
    {
        Task<OneOf<SuccessfulAuthenticationDto, CreateUserError>> CreateUser(RegisterDto register);
        Task<OneOf<SuccessfulAuthenticationDto, CheckCredentialsError>> CheckCredentials(LoginDto login);
    }
}
