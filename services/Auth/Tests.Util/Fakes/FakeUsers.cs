using Bogus;
using Common.Extensions;
using Database.Entities;


namespace Tests.Util.Fakes
{
    public static class FakeUsers
    {
        public static User GenerateFakeUser(string password)
        {
            return new Faker<User>()
                .StrictMode(true)
                .RuleFor(user => user.Id, Guid.NewGuid())
                .RuleFor(user => user.Email, (f) => f.Internet.Email())
                .RuleFor(user => user.NormalizedEmail, (f, u) => u.Email.DatabaseNormalize())
                .RuleFor(user => user.PasswordHash, (f) => BCrypt.Net.BCrypt.EnhancedHashPassword(password))
                .Generate();
        }
    }
}
