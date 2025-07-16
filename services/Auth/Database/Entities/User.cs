using Common.User;
using System.ComponentModel.DataAnnotations;

namespace Database.Entities
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [MaxLength(UserValidationRules.Email.MaxLength)]
        public string Email { get; set; } = string.Empty;

        public string NormalizedEmail { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;
    }
}
