using Auth.Validators;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tests.Unit.Validators
{
    [TestFixture]
    public class HasALowerCaseLetterTests
    {
        public HasALowerCaseLetter Attribute;

        [SetUp]
        public void SetUp()
        {
            Attribute = new HasALowerCaseLetter();
        }

        [Test]
        public void IsValid_ReturnsSuccess_WhenValid()
        {
            // Arrange
            string input = "Hello";
            var context = new ValidationContext(new object());

            // Act
            var result = Attribute.GetValidationResult(input, context);

            // Assert
            Assert.That(result, Is.EqualTo(ValidationResult.Success));
        }

        [Test]
        public void IsValid_ReturnsError_WhenInvalid()
        {
            // Arrange
            string input = "HELLO";
            var context = new ValidationContext(new object());

            // Act
            var result = Attribute.GetValidationResult(input, context);

            // Assert
            Assert.That(result, Is.Not.EqualTo(ValidationResult.Success));
        }

        [Test]
        public void IsValid_ReturnsError_WhenValueIsNotString()
        {
            // Arrange
            var nonStringValue = 12345;
            var context = new ValidationContext(new object());
            // Act
            var result = Attribute.GetValidationResult(nonStringValue, context);

            // Assert
            Assert.That(result, Is.Not.EqualTo(ValidationResult.Success));
        }
    }
}
