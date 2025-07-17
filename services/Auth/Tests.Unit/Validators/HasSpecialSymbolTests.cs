using Auth.Validators;
using System.ComponentModel.DataAnnotations;

namespace Tests.Unit.Validators
{
    public class HasSpecialSymbolTests
    {
        public HasSpecialSymbol Validator { get; set; }

        [SetUp]
        public void SetUp()
        {
            Validator = new HasSpecialSymbol();
        }

        [Test]
        public void IsValid_ReturnsSuccess_WhenValueContainsASpecialSymbol()
        {
            // Arrange
            string value = "hello@";
            var context = new ValidationContext(new object());

            // Act
            var result = Validator.GetValidationResult(value, context);

            // Assert
            Assert.That(result, Is.EqualTo(ValidationResult.Success));
        }

        [Test]
        public void IsValid_DoesNotReturnSuccess_WhenValueDoesNotContainANumber()
        {
            // Arrange
            string value = "hello";
            var context = new ValidationContext(new object());

            // Act
            var result = Validator.GetValidationResult(value, context);

            // Assert
            Assert.That(result, Is.Not.EqualTo(ValidationResult.Success));
        }

        [Test]
        public void IsValid_DoesNotReturnSuccess_WhenValueIsNotAString()
        {
            // Arrange
            int value = 1234;
            var context = new ValidationContext(new object());

            // Act
            var result = Validator.GetValidationResult(value, context);

            // Assert
            Assert.That(result, Is.Not.EqualTo(ValidationResult.Success));
        }

    }
}
