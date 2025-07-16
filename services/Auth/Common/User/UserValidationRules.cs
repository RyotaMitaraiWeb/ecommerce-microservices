namespace Common.User
{
    public static class UserValidationRules
    {
        public static class Email
        {
            public const int MaxLength = 255;
        }

        public static class Password
        {
            public const int MinLength = 8;
            public const int MaxLength = 255;
        }
    }
}
