using Auth.Validators;
using Common.User;
using System.ComponentModel.DataAnnotations;

namespace Auth.Dto
{
    public class RegisterDto
    {
        [Required]
        [MaxLength(UserValidationRules.Email.MaxLength)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(UserValidationRules.Password.MaxLength)]
        [MinLength(UserValidationRules.Password.MinLength)]
        [HasAnUpperCaseLetter]
        public string Password { get; set; } = string.Empty;
    }
}
