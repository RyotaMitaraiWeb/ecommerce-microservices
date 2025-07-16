using Auth.Dto;
using Auth.Enums;
using Auth.Services.Contracts;
using Common.Extensions;
using Database;
using Database.Entities;
using Microsoft.EntityFrameworkCore;
using OneOf;
namespace Auth.Services
{
    public class UserService(AppDbContext _dbContext) : IUserService
    {
        public async Task<OneOf<SuccessfulAuthenticationDto, CreateUserError>> CreateUser(RegisterDto register)
        {
            bool emailIsAvailable = await EmailIsAvailable(register.Email);
            if (!emailIsAvailable)
            {
                return CreateUserError.EmailIsTaken;
            }

            var user = new User()
            {
                Email = register.Email,
                NormalizedEmail = register.Email.DatabaseNormalize(),
                PasswordHash = HashPassword(register.Password),
            };

            await _dbContext.AddAsync(user);

            await _dbContext.SaveChangesAsync();

            return new SuccessfulAuthenticationDto()
            {
                Email = register.Email,
                Id = user.Id.ToString(),
            };
        }

        private static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.EnhancedHashPassword(password);
        }

        private async Task<bool> EmailIsAvailable(string email)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(user => user.NormalizedEmail == email.DatabaseNormalize());
            return user is null;
        }
    }
}
