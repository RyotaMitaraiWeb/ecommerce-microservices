namespace Common.Extensions
{
    public static class StringExtensions
    {
        public static string DatabaseNormalize(this string value)
        {
            return value.Trim().ToUpper();
        }
    }
}
