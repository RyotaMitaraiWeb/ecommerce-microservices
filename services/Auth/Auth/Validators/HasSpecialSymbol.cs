using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Auth.Validators
{
    public partial class HasSpecialSymbol : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is not string)
            {
                return new ValidationResult("Value must be a string");
            }

            string input = value as string ?? string.Empty;

            bool hasASpecialSymbol = SpecialSymbolRegex().Match(input).Success;
            if (!hasASpecialSymbol)
            {
                return new ValidationResult("Value does not contain a special symbol");
            }
            return ValidationResult.Success;
        }
        [GeneratedRegex(@"[!@#\$%\^&\*\(\)_\+\-=\[\]{}\\|;:'"",.<>\/\?]")]
        private static partial Regex SpecialSymbolRegex();
    }
}
