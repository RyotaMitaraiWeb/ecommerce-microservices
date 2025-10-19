using Auth.Web.Extensions;
using Common.Retry;
using ProductsApi.Constants;
using ProductsApi.Retry;

namespace Auth.Web
{
    public partial class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddServices(builder);
            builder.Services.AddBearerAuthentication(builder);
            builder.Services.AddDatabase(builder);
            builder.Services.AddSingleton<IRetryProfileInit, RetryProfileInit>();

            var app = builder.Build();

            Console.WriteLine("running !");

            app.UseSwagger();
            app.UseSwaggerUI();

            //app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
