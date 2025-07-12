namespace Auth.Web.Extensions
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddServices(this IServiceCollection services, WebApplicationBuilder builder)
        {
            return services
                .AddLogging()
                .AddCors();
        }
    }
}
