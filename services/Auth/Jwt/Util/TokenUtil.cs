namespace Jwt.Util
{
    public static class TokenUtil
    {
        public static string RemoveBearer(string? bearerToken)
        {
            return bearerToken?.Replace("Bearer ", string.Empty) ?? string.Empty;
        }
    }
}
