using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Auth.Validators
{
    [AttributeUsage(AttributeTargets.Property |
  AttributeTargets.Field, AllowMultiple = false)]
    public partial class HasANumber : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is not string)
            {
                return new ValidationResult("Value must be a string");
            }

            string input = value as string ?? string.Empty;

            bool hasANumber = NumberRegex().Match(input).Success;
            if (!hasANumber)
            {
                return new ValidationResult("Value does not contain a number");
            }
            return ValidationResult.Success;
        }

        [GeneratedRegex("[0-9]")]
        private static partial Regex NumberRegex();
    }
}
