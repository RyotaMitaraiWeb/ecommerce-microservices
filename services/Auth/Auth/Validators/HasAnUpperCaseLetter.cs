using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Auth.Validators
{
    [AttributeUsage(AttributeTargets.Property |
  AttributeTargets.Field, AllowMultiple = false)]
    public partial class HasAnUpperCaseLetter : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is not string)
            {
                return new ValidationResult("Value must be a string");
            }

            string input = value as string ?? string.Empty;

            bool hasAnUpperCase = UpperCaseRegex().Match(input).Success;
            if (!hasAnUpperCase)
            {
                return new ValidationResult("Value does not contain an uppercase letter");
            }
            return ValidationResult.Success;
        }

        [GeneratedRegex("[A-Z]")]
        private static partial Regex UpperCaseRegex();
    }
}
