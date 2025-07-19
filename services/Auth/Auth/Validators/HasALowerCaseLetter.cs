using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Auth.Validators
{
    [AttributeUsage(AttributeTargets.Property |
  AttributeTargets.Field, AllowMultiple = false)]
    public partial class HasALowerCaseLetter : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is not string)
            {
                return new ValidationResult("Value must be a string");
            }

            string input = value as string ?? string.Empty;

            bool hasALowerCase = LowerCaseRegex().Match(input).Success;
            if (!hasALowerCase)
            {
                return new ValidationResult("Value does not contain a lowercase letter");
            }
            return ValidationResult.Success;
        }

        [GeneratedRegex("[a-z]")]
        private static partial Regex LowerCaseRegex();
    }
}
